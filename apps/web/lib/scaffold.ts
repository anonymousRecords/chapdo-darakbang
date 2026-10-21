import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getKoreanDate, validDate, validSlug } from "./post-loader";

export function createWork({
  directory,
  slug,
  title,
  date = getKoreanDate(),
  renderer = "react",
  interaction,
  interactionIds,
}: {
  directory: string;
  slug: string;
  title: string;
  date?: string;
  renderer?: "react" | "iframe";
  interaction?: string;
  interactionIds: readonly string[];
}): string {
  if (!validSlug(slug))
    throw new Error("slug는 소문자 영문·숫자·하이픈으로 작성하세요.");
  if (!title.trim()) throw new Error("title을 작성하세요.");
  if (!validDate(date) || date.length !== 10)
    throw new Error("date는 유효한 YYYY-MM-DD여야 합니다.");
  if (renderer !== "react" && renderer !== "iframe")
    throw new Error("renderer는 react 또는 iframe이어야 합니다.");
  if (
    renderer === "iframe" &&
    (!interaction || !interactionIds.includes(interaction))
  )
    throw new Error("기존 작품의 interaction을 지정하세요.");
  if (renderer === "react" && interaction !== undefined)
    throw new Error("React 작품에는 interaction을 지정하지 않습니다.");
  const destination = join(directory, slug);
  if (existsSync(destination))
    throw new Error(`${slug}: 이미 존재하는 작품입니다.`);
  mkdirSync(directory, { recursive: true });
  mkdirSync(destination); // No recursive overwrite: another concurrent creation must fail here.
  const metadata = [
    "---",
    `title: ${JSON.stringify(title.trim())}`,
    `date: ${JSON.stringify(date)}`,
    `renderer: ${renderer}`,
  ];
  if (renderer === "iframe") metadata.push(`interaction: ${interaction}`);
  metadata.push(
    `desktopOnly: ${renderer === "iframe"}`,
    "draft: true",
    "---",
    "",
    "이 작품을 만들게 된 이유를 적어 주세요.",
    "",
  );
  writeFileSync(join(destination, "post.mdx"), metadata.join("\n"), {
    flag: "wx",
  });
  if (renderer === "react") {
    writeFileSync(
      join(destination, "Artwork.tsx"),
      `"use client";

import { useState } from "react";
import styles from "./artwork.module.css";

export default function Artwork() {
  const [count, setCount] = useState(0);
  return (
    <div className={styles.canvas}>
      <button className={styles.button} onClick={() => setCount(value => value + 1)}>
        눌러 보세요 <span aria-live="polite">{count}</span>
      </button>
    </div>
  );
}
`,
      { flag: "wx" },
    );
    writeFileSync(
      join(destination, "artwork.module.css"),
      `.canvas { min-height: 360px; display: grid; place-items: center; background: #f1f6f2; }
.button { border: 1px solid #286344; border-radius: 8px; padding: 18px 28px; font: inherit; color: #23352d; background: white; cursor: pointer; }
.button:focus-visible { outline: 2px solid #286344; outline-offset: 4px; }
.button span { margin-left: 12px; font-variant-numeric: tabular-nums; }
`,
      { flag: "wx" },
    );
  }
  return destination;
}
