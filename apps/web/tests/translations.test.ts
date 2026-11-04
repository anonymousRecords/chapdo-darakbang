import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readPosts } from "../lib/post-loader";

test("English sidecar preserves original content and publication settings", () => {
  const directory = mkdtempSync(join(tmpdir(), "chapdo-translation-"));
  try {
    mkdirSync(join(directory, "sample"));
    writeFileSync(join(directory, "sample/post.mdx"), '---\ntitle: 원문\ndate: "2025-01-01"\nrenderer: iframe\ninteraction: sample\n---\n한국어 본문');
    writeFileSync(join(directory, "sample/post.en.mdx"), '---\ntitle: English title\n---\nEnglish body with [link](https://example.com).');
    const [post] = readPosts({ directory, interactionIds: ["sample"] });
    assert.ok(post);
    assert.equal(post.title, "원문");
    assert.equal(post.body, "한국어 본문");
    assert.deepEqual(post.english, { title: "English title", body: "English body with [link](https://example.com)." });
    assert.equal(post.date, "2025-01-01");
    assert.equal(post.unpublished, false);
    writeFileSync(join(directory, "sample/post.en.mdx"), '---\ntitle: ""\n---\nEnglish body');
    assert.throws(() => readPosts({ directory, interactionIds: ["sample"] }), /post.en.mdx/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
