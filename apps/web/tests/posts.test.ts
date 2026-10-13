import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { readPosts, getKoreanDate } from "../lib/post-loader";

function fixture(
  files: Record<string, string>,
  run: (directory: string) => void,
) {
  const directory = mkdtempSync(join(tmpdir(), "chapdo-works-"));
  try {
    for (const [name, source] of Object.entries(files)) {
      const path = join(directory, name);
      mkdirSync(join(path, ".."), { recursive: true });
      writeFileSync(path, source);
    }
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
function post(date: string, extra = "", body = "직접 작성한 제작 이유입니다.") {
  return `---\ntitle: "신호등"\ndate: "${date}"\nrenderer: iframe\ninteraction: traffic-light\n${extra}---\n${body}`.replaceAll(
    "\\n",
    "\n",
  );
}
function load(directory: string, includeUnpublished = false) {
  return readPosts({
    directory,
    interactionIds: ["traffic-light"],
    today: "2026-10-13",
    includeUnpublished,
  });
}
test("published works retain author content and descending full-date order", () => {
  fixture(
    {
      "older/post.mdx": post("2025-09-01"),
      "latest/post.mdx": post("2026-10-13"),
      "middle/post.mdx": post("2026-01-24"),
    },
    (directory) => {
      const posts = load(directory);
      assert.deepEqual(
        posts.map((p) => p.slug),
        ["latest", "middle", "older"],
      );
      assert.equal(posts[2]?.date, "2025-09-01");
      assert.equal(posts[0]?.body, "직접 작성한 제작 이유입니다.");
      assert.equal(posts[0]?.renderer, "iframe");
    },
  );
});
test("production excludes draft and future works; author preview includes both", () => {
  fixture(
    {
      "today/post.mdx": post("2026-10-13"),
      "future/post.mdx": post("2026-10-14"),
      "draft/post.mdx": post("2026-10-12", "draft: true\n"),
      "future-month/post.mdx": post("2026-11-01"),
    },
    (directory) => {
      assert.deepEqual(
        load(directory).map((p) => p.slug),
        ["today"],
      );
      assert.deepEqual(
        load(directory, true).map((p) => [p.slug, p.unpublished]),
        [
          ["future-month", true],
          ["future", true],
          ["today", false],
          ["draft", true],
        ],
      );
    },
  );
});
test("Korean publication date changes at Korean midnight", () => {
  assert.equal(getKoreanDate(new Date("2026-10-12T14:59:59Z")), "2026-10-12");
  assert.equal(getKoreanDate(new Date("2026-10-12T15:00:00Z")), "2026-10-13");
});
test("invalid calendar dates and unquoted YAML dates fail with source path", () => {
  for (const date of ["2026-02-29", "2026-13", "2026-04-31", "26-01", "2026-01"]) {
    fixture({ "invalid/post.mdx": post(date) }, (directory) =>
      assert.throws(() => load(directory), /invalid.*post\.mdx.*date/),
    );
  }
  fixture(
    {
      "invalid/post.mdx": post("2026-10-13").replace(
        'date: "2026-10-13"',
        "date: 2026-10-13",
      ),
    },
    (directory) => assert.throws(() => load(directory), /invalid.*date/),
  );
});
test("leap days are accepted and equal dates have stable slug order", () => {
  fixture(
    { "z/post.mdx": post("2024-02-29"), "a/post.mdx": post("2024-02-29") },
    (directory) =>
      assert.deepEqual(
        load(directory).map((p) => p.slug),
        ["a", "z"],
      ),
  );
});
test("missing iframe artwork and empty title cannot publish", () => {
  fixture(
    {
      "missing/post.mdx": post("2026-10-13").replace(
        "traffic-light",
        "does-not-exist",
      ),
    },
    (directory) => assert.throws(() => load(directory), /missing.*interaction/),
  );
  fixture({ "empty/post.mdx": post("2026-10-13", "", "   ") }, (directory) =>
    assert.equal(load(directory)[0]?.body, ""),
  );
  fixture(
    {
      "empty/post.mdx": post("2026-10-13").replace(
        'title: "신호등"',
        'title: " "',
      ),
    },
    (directory) => assert.throws(() => load(directory), /empty.*title/),
  );
});
test("quoted booleans cannot accidentally publish drafts or hide artworks", () => {
  for (const field of ["draft", "desktopOnly"]) {
    fixture(
      { "invalid/post.mdx": post("2026-10-13", `${field}: "false"\n`) },
      (directory) =>
        assert.throws(() => load(directory), new RegExp(`invalid.*${field}`)),
    );
  }
});
test("React works use their colocated Artwork.tsx without a legacy ID", () => {
  const react = post("2026-10-13").replace(
    "renderer: iframe\ninteraction: traffic-light",
    "renderer: react",
  );
  fixture(
    {
      "native/post.mdx": react,
      "native/Artwork.tsx":
        "export default function Artwork() { return null; }",
    },
    (directory) => {
      const result = load(directory)[0];
      assert.equal(result?.renderer, "react");
      assert.equal(result?.slug, "native");
      assert.equal(result?.desktopOnly, true);
      assert.equal("interaction" in result!, false);
    },
  );
  fixture({ "native/post.mdx": react }, (directory) =>
    assert.throws(() => load(directory), /native.*Artwork\.tsx/),
  );
});
test("unknown renderer and conflicting React interaction metadata fail", () => {
  fixture(
    {
      "invalid/post.mdx": post("2026-10-13").replace(
        "renderer: iframe",
        "renderer: canvas",
      ),
    },
    (directory) => assert.throws(() => load(directory), /renderer/),
  );
  fixture(
    {
      "invalid/post.mdx": post("2026-10-13").replace(
        "renderer: iframe",
        "renderer: react",
      ),
      "invalid/Artwork.tsx": "export default () => null;",
    },
    (directory) => assert.throws(() => load(directory), /interaction/),
  );
});
test("unsafe slug and incomplete work folder fail instead of silently disappearing", () => {
  fixture({ "bad name/post.mdx": post("2026-10-13") }, (directory) =>
    assert.throws(() => load(directory), /slug/),
  );
  fixture(
    { "incomplete/Artwork.tsx": "export default () => null;" },
    (directory) => assert.throws(() => load(directory), /post\.mdx/),
  );
});
test("empty journal and non-work files are supported", () =>
  fixture({ "README.md": "How to add works" }, (directory) =>
    assert.deepEqual(load(directory), []),
  ));

test("all 19 existing artworks have complete dates matching the commit evidence", () => {
  const directory = join(process.cwd(), "works");
  const evidence = JSON.parse(readFileSync(join(directory, "commit-dates.json"), "utf8")) as {
    works: { slug: string; date: string; authorDate: string; commit: string }[];
  };
  const appDirectory = join(process.cwd(), "..");
  const ids = readdirSync(appDirectory).filter((name) => name !== "web");
  const posts = readPosts({ directory, interactionIds: ids, today: "2026-10-13" });
  assert.equal(posts.length, 19);
  assert.equal(evidence.works.length, 19);
  for (const record of evidence.works) {
    assert.match(record.commit, /^[a-f0-9]{40}$/);
    assert.match(record.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(record.date, getKoreanDate(new Date(record.authorDate)));
    assert.equal(posts.find((p) => p.slug === record.slug)?.date, record.date);
  }
  assert.equal(posts.filter((p) => p.body).length, 4);
});
