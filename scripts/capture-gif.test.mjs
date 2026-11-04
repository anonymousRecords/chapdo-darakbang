import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";
import sharp from "sharp";

const exec = promisify(execFile);
const script = fileURLToPath(new URL("./capture-gif.mjs", import.meta.url));

test("documented pnpm-style separator supports help", async () => {
  const { stdout } = await exec(process.execPath, [script, "--", "--help"]);
  assert.match(stdout, /Usage:/);
});

test("capture preserves elapsed action timing and produces animated GIF and final poster", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "capture-gif-test-"));
  const events = [];
  const server = http.createServer((req, res) => {
    if (req.url.startsWith("/event?")) {
      events.push(JSON.parse(decodeURIComponent(req.url.slice(7))));
      res.end("ok");
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.end(`<!doctype html><style>
      body { margin:0; background:linear-gradient(135deg,red,orange,purple,green,blue); }
      button { width:200px; height:100px; }
      </style><button>Capture</button><script>
      const report = type => fetch('/event?' + encodeURIComponent(JSON.stringify({type,at:performance.now()})));
      const button = document.querySelector('button');
      button.onmouseenter = () => report('hover');
      button.onclick = () => { document.body.style.background = 'rgb(0, 0, 255)'; report('click'); };
      document.onkeydown = () => report('press');
      document.onwheel = () => report('scroll');
      document.onmousemove = event => { if(event.clientX === 400) report('move'); };
      </script>`);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const scenario = path.join(dir, "scenario.json");
    await writeFile(scenario, JSON.stringify({ steps: [
      { at: 0, type: "hover", selector: "button" },
      { at: 1000, type: "click", selector: "button" },
      { at: 1200, type: "move", x: 400, y: 300 },
      { at: 1400, type: "press", key: "ArrowDown" },
      { at: 1600, type: "scroll", x: 0, y: 100 },
    ] }));
    await exec(process.execPath, [script, "--", `http://127.0.0.1:${server.address().port}/work`,
      "--out", dir, "--duration", "2", "--settle", "0", "--scenario", scenario], { timeout: 60_000 });
    const elapsed = events.find(event => event.type === "click").at - events.find(event => event.type === "hover").at;
    assert.ok(elapsed >= 700 && elapsed <= 1300, `1s action executed after ${Math.round(elapsed)}ms`);
    for (const type of ["hover", "click", "move", "press", "scroll"]) {
      assert.ok(events.some(event => event.type === type), `${type} action did not run`);
    }
    const gif = await sharp(path.join(dir, "preview.gif"), { animated: true }).metadata();
    assert.equal(gif.width, 720);
    assert.equal(gif.pageHeight, 540);
    assert.ok(gif.pages > 1 && gif.pages <= 24);
    assert.equal(gif.loop, 0);
    const first = await sharp(path.join(dir, "preview.gif"), { page: 0 }).raw().toBuffer();
    const last = await sharp(path.join(dir, "preview.gif"), { page: gif.pages - 1 }).raw().toBuffer();
    assert.notDeepEqual(first, last, "GIF must contain the interaction's visual change");
    const duration = gif.delay.reduce((sum, delay) => sum + delay, 0);
    assert.ok(Math.abs(duration - 2000) <= 10, `GIF duration was ${duration}ms`);
    const poster = await sharp(path.join(dir, "poster.webp")).metadata();
    assert.equal(poster.width, 720);
    assert.equal(poster.height, 540);
    const pixel = await sharp(path.join(dir, "poster.webp"))
      .extract({ left: 600, top: 400, width: 1, height: 1 }).raw().toBuffer();
    assert.ok(pixel[2] > 240 && pixel[0] < 15 && pixel[1] < 15, `final poster pixel: ${pixel}`);
    assert.ok((await readFile(path.join(dir, "preview.gif"))).length > 0);
    console.log(`Scenario click: ${Math.round(elapsed)}ms; GIF: ${gif.pages} frames, ${duration}ms`);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(dir, { recursive: true, force: true });
  }
});
