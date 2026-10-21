import { existsSync } from "node:fs";
import { join } from "node:path";
import { PreviewImage } from "./PreviewImage";
import type { Post } from "../lib/post-loader";
import { getUrl } from "../app/registry";
import { Artwork } from "./Artwork";
import { NativeArtwork } from "./NativeArtwork";
import { Story } from "./Language";
import { PostBody } from "./PostBody";

export function WorkPreview({ post }: { post: Post }) {
  const liveUrl = post.renderer === "iframe"
    ? `https://chapdo-darakbang.vercel.app${getUrl(post.interaction, false)}`
    : undefined;
  const preview = `/works/${post.slug}/preview.gif`;
  const hasPreview = post.renderer === "iframe" && existsSync(
    join(process.cwd(), "public", "works", post.slug, "preview.gif"),
  );

  return (
    <>
      {hasPreview && post.renderer === "iframe" ? (
        <figure className="work-recording">
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet={`/works/${post.slug}/poster.webp`} />
            <PreviewImage
              src={preview}
              title={post.title}
              englishTitle={post.english?.title ?? post.title}
              width={720}
              height={540}
              unoptimized
              className="work-recording-image"
            />
          </picture>
          <figcaption>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer">
              <span>{post.interaction}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          </figcaption>
        </figure>
      ) : (
      <>
      <Artwork
        title={post.title}
        englishTitle={post.english?.title ?? post.title}
        url={post.renderer === "iframe"
          ? getUrl(post.interaction, false)
          : undefined}
        desktopOnly={post.desktopOnly}
      >
        {post.renderer === "react" && <NativeArtwork slug={post.slug} />}
      </Artwork>
      {post.renderer === "iframe" && <div className="work-recording work-live-link">
        <a href={liveUrl} target="_blank" rel="noopener noreferrer">
          <span>{post.interaction}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
        </a>
      </div>}
      </>
      )}
      {post.body && <Story
        ko={<PostBody source={post.body} />}
        en={<PostBody source={post.english?.body ?? post.body} />}
      />}
    </>
  );
}
