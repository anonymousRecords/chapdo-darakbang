import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";

export async function PostBody({ source }: { source: string }) {
  // Only repository-authored MDX is evaluated, at build time on the server.
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
  });
  return (
    <div className="prose">
      <Content />
    </div>
  );
}
