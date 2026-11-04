#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import sharp from "sharp";
import gifenc from "gifenc";

const { GIFEncoder, quantize, applyPalette } = gifenc;
const defaults = { width: 720, height: 540, fps: 12, duration: 4, settle: 1000 };

function usage() {
  return `Usage:
  pnpm capture:gif -- <url> [options]

Options:
  --out <dir>          Output directory (default: apps/web/public/works/<url-slug>)
  --width <px>         Viewport width (default: ${defaults.width})
  --height <px>        Viewport height (default: ${defaults.height})
  --fps <n>            Frames per second (default: ${defaults.fps})
  --duration <seconds> Recording duration (default: ${defaults.duration})
  --settle <ms>        Wait after page load before recording (default: ${defaults.settle})
  --scenario <file>    JSON file with timed interactions
  --help               Show this help

Scenario format:
  { "steps": [
    { "at": 500, "type": "hover", "selector": ".card" },
    { "at": 1300, "type": "click", "selector": "button" },
    { "at": 2200, "type": "scroll", "x": 0, "y": 400 }
  ] }

Supported actions: click, hover, move, scroll, press. Times are milliseconds
after recording starts. Selectors use Playwright CSS selector syntax.`;
}

function parseArgs(argv) {
  const options = { ...defaults };
  let url;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (!["out", "width", "height", "fps", "duration", "settle", "scenario"].includes(key)) {
        throw new Error(`Unknown option: ${arg}`);
      }
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      options[key] = ["width", "height", "fps", "duration", "settle"].includes(key)
        ? Number(value)
        : value;
      i += 1;
    } else if (!url) {
      url = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  if (!url) throw new Error("A page URL is required.");
  for (const key of ["width", "height", "fps", "duration", "settle"]) {
    if (!Number.isFinite(options[key]) || options[key] < (key === "settle" ? 0 : 1)) {
      throw new Error(`--${key} must be ${key === "settle" ? "zero or greater" : "a positive number"}.`);
    }
  }
  const parsedUrl = new URL(url);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("URL must use http:// or https://.");
  }
  options.url = parsedUrl.toString();
  if (!options.out) {
    const slug = parsedUrl.pathname.split("/").filter(Boolean).at(-1) || "preview";
    options.out = path.join("apps/web/public/works", slug);
  }
  return options;
}

async function runAction(page, step) {
  const hasSelector = typeof step.selector === "string";
  const target = hasSelector ? page.locator(step.selector).first() : null;
  switch (step.type) {
    case "click":
      if (target) await target.click();
      else await page.mouse.click(Number(step.x) || 0, Number(step.y) || 0);
      break;
    case "hover":
      if (target) await target.hover();
      else await page.mouse.move(Number(step.x) || 0, Number(step.y) || 0);
      break;
    case "move":
      await page.mouse.move(Number(step.x) || 0, Number(step.y) || 0);
      break;
    case "scroll":
      await page.mouse.wheel(Number(step.x) || 0, Number(step.y) || 0);
      break;
    case "press":
      await page.keyboard.press(step.key);
      break;
    default:
      throw new Error(`Unsupported scenario action: ${step.type}`);
  }
}

async function loadScenario(file) {
  if (!file) return [];
  const json = JSON.parse(await readFile(file, "utf8"));
  if (!Array.isArray(json.steps)) throw new Error("Scenario JSON must contain a steps array.");
  const steps = json.steps.map((step, index) => {
    if (!step || !Number.isFinite(step.at) || step.at < 0 || typeof step.type !== "string") {
      throw new Error(`Scenario step ${index + 1} needs a non-negative at value and a type.`);
    }
    return step;
  }).sort((a, b) => a.at - b.at);
  return steps;
}

async function capture(options) {
  const steps = await loadScenario(options.scenario);
  const frameDelay = 1000 / options.fps;
  const frameCount = Math.max(1, Math.round(options.duration * options.fps));
  const outputDir = path.resolve(options.out);
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: options.width, height: options.height },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(options.settle);

    const encoder = GIFEncoder();
    let poster;
    let nextStep = 0;
    for (let frame = 0; frame < frameCount; frame += 1) {
      const at = frame * frameDelay;
      while (nextStep < steps.length && steps[nextStep].at <= at) {
        await runAction(page, steps[nextStep]);
        nextStep += 1;
      }
      const screenshot = await page.screenshot({ type: "png" });
      const { data } = await sharp(screenshot)
        .resize(options.width, options.height, { fit: "fill" })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const rgba = Uint8Array.from(data);
      const palette = quantize(rgba, 256);
      const indexed = applyPalette(rgba, palette);
      encoder.writeFrame(indexed, options.width, options.height, {
        palette,
        delay: frameDelay,
        repeat: 0,
        dispose: 1,
      });
      if (frame === frameCount - 1) {
        poster = await sharp(screenshot)
          .resize(options.width, options.height, { fit: "fill" })
          .webp({ quality: 82 })
          .toBuffer();
      }
      if (frame < frameCount - 1) await page.waitForTimeout(frameDelay);
    }
    encoder.finish();
    await Promise.all([
      writeFile(path.join(outputDir, "preview.gif"), encoder.bytesView()),
      writeFile(path.join(outputDir, "poster.webp"), poster),
    ]);
    console.log(`Saved ${path.join(outputDir, "preview.gif")}`);
    console.log(`Saved ${path.join(outputDir, "poster.webp")}`);
  } finally {
    await browser.close();
  }
}

try {
  const args = process.argv.slice(2);
  const options = parseArgs(args[0] === "--" ? args.slice(1) : args);
  if (options.help) console.log(usage());
  else await capture(options);
} catch (error) {
  console.error(`GIF capture failed: ${error.message}`);
  console.error("Run `pnpm capture:gif -- --help` for usage.");
  process.exitCode = 1;
}
