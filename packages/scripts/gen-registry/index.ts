import * as fs from "fs";
import * as path from "path";

interface AppEntry {
  id: string;
  title: string;
  port: number;
}

const ROOT = path.resolve(__dirname, "../../..");
const APPS_DIR = path.join(ROOT, "apps");
const WEB_DIR = path.join(APPS_DIR, "web");
const OUTPUT_FILE = path.join(WEB_DIR, "app/registry.ts");

function isViteApp(appDir: string): boolean {
  const hasIndexHtml = fs.existsSync(path.join(appDir, "index.html"));
  const hasPackageJson = fs.existsSync(path.join(appDir, "package.json"));
  return hasIndexHtml && hasPackageJson;
}

/**
 * meta.json은 인터랙션의 유일한 진실 원천이다.
 * vite.config도 같은 파일에서 port/id를 읽으므로 여기서 어긋나면 dev 서버와
 * 갤러리 링크가 조용히 갈라진다. 따라서 누락/불량은 경고가 아니라 실패로 다룬다.
 */
function readMeta(
  dir: string,
  appDir: string,
  errors: string[],
): AppEntry | null {
  const metaPath = path.join(appDir, "meta.json");

  if (!fs.existsSync(metaPath)) {
    errors.push(
      `${dir}: meta.json이 없습니다. { "id", "title", "port" }를 정의하세요.`,
    );
    return null;
  }

  let meta: unknown;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } catch (error) {
    errors.push(`${dir}: meta.json 파싱 실패 — ${(error as Error).message}`);
    return null;
  }

  const { id, title, port } = (meta ?? {}) as Partial<AppEntry>;

  if (typeof id !== "string" || id.length === 0) {
    errors.push(`${dir}: meta.json의 "id"가 비어 있거나 문자열이 아닙니다.`);
    return null;
  }
  if (id !== dir) {
    errors.push(`${dir}: meta.json의 "id"(${id})가 디렉토리명과 다릅니다.`);
    return null;
  }
  if (typeof title !== "string" || title.length === 0) {
    errors.push(`${dir}: meta.json의 "title"이 비어 있거나 문자열이 아닙니다.`);
    return null;
  }
  if (typeof port !== "number" || !Number.isInteger(port)) {
    errors.push(`${dir}: meta.json의 "port"가 없거나 정수가 아닙니다.`);
    return null;
  }

  return { id, title, port };
}

function discoverApps(errors: string[]): AppEntry[] {
  const entries: AppEntry[] = [];
  const portOwner = new Map<number, string>();

  for (const dir of fs.readdirSync(APPS_DIR)) {
    const appDir = path.join(APPS_DIR, dir);

    if (!fs.statSync(appDir).isDirectory()) continue;
    if (dir === "web") continue;
    if (!isViteApp(appDir)) continue;

    const entry = readMeta(dir, appDir, errors);
    if (!entry) continue;

    // strictPort: true라 포트가 겹치면 나중에 뜬 dev 서버가 그냥 죽는다. 미리 잡는다.
    const owner = portOwner.get(entry.port);
    if (owner) {
      errors.push(`${dir}: 포트 ${entry.port}이 ${owner}와 중복입니다.`);
      continue;
    }
    portOwner.set(entry.port, dir);

    entries.push(entry);
  }

  entries.sort((a, b) => a.title.localeCompare(b.title));

  return entries;
}

function generateRegistry(entries: AppEntry[]): string {
  const portMapEntries = entries
    .map((e) => `  "${e.id}": ${e.port}`)
    .join(",\n");

  const interactionEntries = entries
    .map((e) => `  ${JSON.stringify({ id: e.id, title: e.title })}`)
    .join(",\n");

  return `/** AUTO-GENERATED — do not edit. \`pnpm gen:registry\`로 재생성됩니다. */

export interface InteractionEntry {
  id: string;
  title: string;
}

const portMap: Record<string, number> = {
${portMapEntries}
};

export const interactions: InteractionEntry[] = [
${interactionEntries}
];

export function getUrl(id: string, isDev: boolean): string {
  const port = portMap[id];
  if (isDev && port) {
    return \`http://localhost:\${port}\`;
  }
  return \`/interactions/\${id}/\`;
}
`;
}

function main() {
  console.log("Discovering apps...");

  const errors: string[] = [];
  const entries = discoverApps(errors);

  if (errors.length > 0) {
    console.error(`\nmeta.json 검증 실패 (${errors.length}건):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Found ${entries.length} apps:`);
  entries.forEach((e) => console.log(`  - ${e.id} (port ${e.port})`));

  const registry = generateRegistry(entries);

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, registry);
  console.log(`\nGenerated: ${OUTPUT_FILE}`);
}

main();
