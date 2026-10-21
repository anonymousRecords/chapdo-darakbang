import { join } from "node:path";
import { interactions } from "../app/registry";
import { readPosts } from "./post-loader";

export function getPosts() {
  return readPosts({
    directory: join(process.cwd(), "works"),
    interactionIds: interactions.map((entry) => entry.id),
    includeUnpublished: process.env.NODE_ENV === "development",
  });
}
export function formatDate(date: string) {
  return date.slice(2);
}
