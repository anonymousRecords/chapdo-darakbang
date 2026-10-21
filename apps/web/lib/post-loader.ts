import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

interface PostBase {
  slug: string;
  title: string;
  date: string;
  desktopOnly: boolean;
  body: string;
  unpublished: boolean;
  english?: { title: string; body: string };
}
export type Post = PostBase &
  ({ renderer: "react" } | { renderer: "iframe"; interaction: string });
export const validSlug = (value: string) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export function getKoreanDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const day = value;
  const parsed = new Date(`${day}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day
  );
}
export function readPosts({
  directory,
  interactionIds,
  today = getKoreanDate(),
  includeUnpublished = false,
}: {
  directory: string;
  interactionIds: readonly string[];
  today?: string;
  includeUnpublished?: boolean;
}): Post[] {
  const posts: Post[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const slug = entry.name;
    const filename = `${slug}/post.mdx`;
    const fail = (reason: string): never => {
      throw new Error(`${filename}: ${reason}`);
    };
    if (!validSlug(slug))
      fail("slug는 소문자 영문·숫자·하이픈으로 작성하세요.");
    if (!existsSync(join(directory, filename))) fail("post.mdx가 없습니다.");
    let parsed: ReturnType<typeof matter>;
    try {
      parsed = matter(readFileSync(join(directory, filename), "utf8"));
    } catch (error) {
      fail(`frontmatter 파싱 실패: ${String(error)}`);
    }
    const { data, content } = parsed!;
    if (typeof data.title !== "string" || !data.title.trim())
      fail("title을 작성하세요.");
    if (!validDate(data.date))
      fail("date는 따옴표로 감싼 유효한 YYYY-MM-DD이어야 합니다.");
    for (const field of ["draft", "desktopOnly"]) {
      if (data[field] !== undefined && typeof data[field] !== "boolean")
        fail(`${field}는 true 또는 false여야 합니다.`);
    }
    if (data.renderer !== "react" && data.renderer !== "iframe")
      fail("renderer는 react 또는 iframe이어야 합니다.");
    if (data.renderer === "iframe") {
      if (
        typeof data.interaction !== "string" ||
        !interactionIds.includes(data.interaction)
      )
        fail("interaction이 작품 레지스트리에 없습니다.");
    } else {
      if (data.interaction !== undefined)
        fail("React 작품에는 interaction을 지정하지 않습니다.");
      if (!existsSync(join(directory, slug, "Artwork.tsx")))
        fail("React 작품의 Artwork.tsx가 없습니다.");
    }
    const unpublished = data.draft === true || data.date > today;
    if (unpublished && !includeUnpublished) continue;
    const base: PostBase = {
      slug,
      title: data.title.trim(),
      date: data.date,
      desktopOnly: data.desktopOnly ?? true,
      body: content.trim(),
      unpublished,
    };
    const englishPath = join(directory, slug, "post.en.mdx");
    if (existsSync(englishPath)) {
      const translation = matter(readFileSync(englishPath, "utf8"));
      if (typeof translation.data.title !== "string" || !translation.data.title.trim())
        fail("post.en.mdx: English title is required.");
      if (base.body && !translation.content.trim())
        fail("post.en.mdx: English body is required when the original has a body.");
      base.english = { title: translation.data.title.trim(), body: translation.content.trim() };
    }
    posts.push(
      data.renderer === "iframe"
        ? { ...base, renderer: "iframe", interaction: data.interaction }
        : { ...base, renderer: "react" },
    );
  }
  return posts.sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}
