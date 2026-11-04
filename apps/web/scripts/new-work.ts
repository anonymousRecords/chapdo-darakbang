import { parseArgs } from "node:util";
import { join } from "node:path";
import { interactions } from "../app/registry";
import { createWork } from "../lib/scaffold";
import { generateWorkRegistry } from "../lib/work-registry";

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      title: { type: "string" },
      date: { type: "string" },
      renderer: { type: "string", default: "react" },
      interaction: { type: "string" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(
      'pnpm new:work <slug> --title "작품 제목" [--date YYYY-MM-DD] [--renderer iframe --interaction 기존-id]',
    );
  } else {
    if (positionals.length !== 1 || !values.title)
      throw new Error(
        'pnpm new:work <slug> --title "작품 제목" 형식으로 실행하세요.',
      );
    if (values.renderer !== "react" && values.renderer !== "iframe")
      throw new Error("renderer는 react 또는 iframe이어야 합니다.");
    const directory = join(process.cwd(), "works");
    const interactionIds = interactions.map((entry) => entry.id);
    const destination = createWork({
      directory,
      slug: positionals[0]!,
      title: values.title,
      date: values.date,
      renderer: values.renderer,
      interaction: values.interaction,
      interactionIds,
    });
    generateWorkRegistry({
      directory,
      output: join(process.cwd(), "lib/works.generated.tsx"),
      interactionIds,
      includeUnpublished: true,
    });
    console.log(
      `초안 생성: ${destination}\n미리보기: pnpm dev:web → /works/${positionals[0]}/\n게시: post.mdx의 draft를 false로 바꾸고 pnpm build`,
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
