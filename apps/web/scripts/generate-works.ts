import { join } from "node:path";
import { interactions } from "../app/registry";
import { generateWorkRegistry } from "../lib/work-registry";

generateWorkRegistry({
  directory: join(process.cwd(), "works"),
  output: join(process.cwd(), "lib/works.generated.tsx"),
  interactionIds: interactions.map((entry) => entry.id),
  includeUnpublished: process.argv.includes("--include-drafts"),
});
