import { watch } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { interactions } from "../app/registry";
import { generateWorkRegistry } from "../lib/work-registry";

const directory = join(process.cwd(), "works");
const regenerate = () =>
  generateWorkRegistry({
    directory,
    output: join(process.cwd(), "lib/works.generated.tsx"),
    interactionIds: interactions.map((entry) => entry.id),
    includeUnpublished: true,
  });
regenerate();
let timer: ReturnType<typeof setTimeout> | undefined;
const watcher = watch(directory, { recursive: true }, () => {
  // Folder rename/delete events do not carry a post.mdx filename.
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      regenerate();
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  }, 100);
});
const require = createRequire(import.meta.url);
const child = spawn(
  process.execPath,
  [
    require.resolve("next/dist/bin/next"),
    "dev",
    "--turbopack",
    "--port",
    "3000",
    ...process.argv.slice(2),
  ],
  { stdio: "inherit" },
);
const cleanup = () => {
  clearTimeout(timer);
  watcher.close();
};
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    cleanup();
    child.kill(signal);
  });
child.on("error", (error) => {
  console.error(error);
  cleanup();
  process.exitCode = 1;
});
child.on("exit", (code) => {
  cleanup();
  process.exitCode = code ?? 0;
});
