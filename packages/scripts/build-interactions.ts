import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(__dirname, "../..");
const APPS_DIR = path.join(ROOT, "apps");
const WEB_DIR = path.join(APPS_DIR, "web");
const OUTPUT_DIR = path.join(WEB_DIR, "public/interactions");

function isViteApp(appDir: string): boolean {
  const hasIndexHtml = fs.existsSync(path.join(appDir, "index.html"));
  const hasPackageJson = fs.existsSync(path.join(appDir, "package.json"));
  return hasIndexHtml && hasPackageJson;
}

function discoverViteApps(): string[] {
  const apps: string[] = [];
  const dirs = fs.readdirSync(APPS_DIR);

  for (const dir of dirs) {
    const appDir = path.join(APPS_DIR, dir);

    if (!fs.statSync(appDir).isDirectory()) continue;
    if (dir === "web") continue;
    if (!isViteApp(appDir)) continue;

    apps.push(dir);
  }

  return apps.sort();
}

function buildApp(appName: string): void {
  const appDir = path.join(APPS_DIR, appName);
  const outputPath = path.join(OUTPUT_DIR, appName);

  console.log(`\nBuilding ${appName}...`);

  // Clean previous build
  if (fs.existsSync(outputPath)) {
    fs.rmSync(outputPath, { recursive: true });
  }

  // Build with BUILD_FOR_GALLERY env var
  execSync("pnpm vite build --outDir " + outputPath, {
    cwd: appDir,
    env: { ...process.env, BUILD_FOR_GALLERY: "true" },
    stdio: "inherit",
  });

  console.log(`Built ${appName} -> ${outputPath}`);
}

function main() {
  console.log("Discovering Vite apps...");
  const apps = discoverViteApps();
  console.log(`Found ${apps.length} apps: ${apps.join(", ")}`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Build each app
  let success = 0;
  const failed: string[] = [];

  for (const app of apps) {
    try {
      buildApp(app);
      success++;
    } catch (error) {
      console.error(`Failed to build ${app}:`, error);
      failed.push(app);
    }
  }

  console.log(`\n========================================`);
  console.log(`Build complete: ${success} succeeded, ${failed.length} failed`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  // 빌드에 실패한 앱은 갤러리에 카드만 남고 404가 된다.
  // 배포가 조용히 성공하지 않도록 반드시 실패로 종료한다.
  if (failed.length > 0) {
    console.error(`\nFailed apps: ${failed.join(", ")}`);
    process.exitCode = 1;
  }
}

main();
