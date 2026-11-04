import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createWork } from "../lib/scaffold";
import { readPosts } from "../lib/post-loader";

function fixture(run: (directory: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), "chapdo-scaffold-"));
  try {
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
const options = {
  slug: "falling-dots",
  title: '점: "떨어짐"',
  date: "2026-10-13",
  renderer: "react" as const,
  interactionIds: ["traffic-light"],
};
test("new React work is an editable draft with colocated component and CSS", () =>
  fixture((directory) => {
    createWork({ directory, ...options });
    assert.ok(existsSync(join(directory, "falling-dots/Artwork.tsx")));
    assert.ok(existsSync(join(directory, "falling-dots/artwork.module.css")));
    const result = readPosts({
      directory,
      interactionIds: [],
      today: "2026-10-13",
      includeUnpublished: true,
    });
    assert.equal(result[0]?.title, '점: "떨어짐"');
    assert.equal(result[0]?.renderer, "react");
    assert.equal(result[0]?.desktopOnly, false);
    assert.equal(result[0]?.unpublished, true);
    assert.deepEqual(
      readPosts({ directory, interactionIds: [], today: "2026-10-13" }),
      [],
    );
  }));
test("duplicate creation never changes existing work", () =>
  fixture((directory) => {
    createWork({ directory, ...options });
    const before = readFileSync(
      join(directory, "falling-dots/post.mdx"),
      "utf8",
    );
    assert.throws(
      () => createWork({ directory, ...options, title: "overwrite" }),
      /이미 존재/,
    );
    assert.equal(
      readFileSync(join(directory, "falling-dots/post.mdx"), "utf8"),
      before,
    );
  }));
test("invalid inputs leave no partial work directory", () =>
  fixture((directory) => {
    for (const overrides of [
      { slug: "../escape" },
      { slug: "Bad Name" },
      { title: " " },
      { date: "2026-02-30" },
      { date: "2026-10" },
    ]) {
      assert.throws(() => createWork({ directory, ...options, ...overrides }));
    }
    assert.deepEqual(readdirSync(directory), []);
  }));
test("iframe draft connects an existing artwork without a React stub", () =>
  fixture((directory) => {
    createWork({
      directory,
      ...options,
      renderer: "iframe",
      interaction: "traffic-light",
    });
    const result = readPosts({
      directory,
      interactionIds: ["traffic-light"],
      today: "2026-10-13",
      includeUnpublished: true,
    })[0];
    assert.equal(result?.renderer, "iframe");
    assert.equal(
      result && "interaction" in result && result.interaction,
      "traffic-light",
    );
    assert.equal(
      existsSync(join(directory, "falling-dots/Artwork.tsx")),
      false,
    );
  }));
test("invalid iframe and conflicting React reference do not create files", () =>
  fixture((directory) => {
    assert.throws(
      () =>
        createWork({
          directory,
          ...options,
          renderer: "iframe",
          interaction: "missing",
        }),
      /interaction/,
    );
    assert.throws(
      () => createWork({ directory, ...options, interaction: "traffic-light" }),
      /interaction/,
    );
    assert.deepEqual(readdirSync(directory), []);
  }));
