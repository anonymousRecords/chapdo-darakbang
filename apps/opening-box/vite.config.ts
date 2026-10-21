import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "node:fs";

const meta = JSON.parse(
  readFileSync(new URL("./meta.json", import.meta.url), "utf-8"),
) as { id: string; port: number };

export default defineConfig({
  plugins: [react()],
  server: {
    port: meta.port,
    strictPort: true,
  },
  base: process.env.BUILD_FOR_GALLERY ? `/interactions/${meta.id}/` : "/",
});
