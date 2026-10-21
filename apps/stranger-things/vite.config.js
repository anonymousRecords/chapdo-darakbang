import { defineConfig } from "vite";
import { readFileSync } from "node:fs";

const meta = JSON.parse(
  readFileSync(new URL("./meta.json", import.meta.url), "utf-8"),
);

export default defineConfig({
  server: {
    port: meta.port,
    strictPort: true,
  },
  base: process.env.BUILD_FOR_GALLERY ? `/interactions/${meta.id}/` : "/",
});
