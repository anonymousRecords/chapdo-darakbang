import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosts, formatDate } from "../../../lib/posts";
import { Text, LanguageSwitch, PostNavigation, DocumentTitle } from "../../../components/Language";
import { WorkPreview } from "../../../components/WorkPreview";

export const dynamicParams = false;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPosts().find((entry) => entry.slug === slug);
  if (!post) notFound();
  return {
    title: post.title,
    description: `${post.title} — 작품을 만든 이유와 직접 체험할 수 있는 인터랙션.`,
    openGraph: {
      title: post.title,
      description: `${formatDate(post.date)}에 기록한 작품 이야기`,
      type: "article",
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const posts = getPosts();
  const index = posts.findIndex((entry) => entry.slug === slug);
  const post = posts[index];
  if (!post) notFound();
  const newer = posts[index - 1];
  const older = posts[index + 1];

  return (
    <main id="main" className="post-page">
      <DocumentTitle ko={`${post.title} | 찹도 다락방`} en={`${post.english?.title ?? post.title} | Chapdo’s Attic`} />
      <Link className="back-link" href="/">
        <Text ko="찹도 다락방" en="Chapdo’s Attic" />
      </Link>
      <LanguageSwitch />
      <header className="post-header">
        <h1><Text ko={post.title} en={post.english?.title ?? post.title} /></h1>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.unpublished && (
          <span className="draft-label"><Text ko="미공개 미리보기" en="Unpublished preview" /></span>
        )}
      </header>
      <WorkPreview post={post} />
      <PostNavigation>
        <div>
          {older && (
            <Link href={`/works/${older.slug}/`}>
              <span><Text ko="이전 기록" en="Previous entry" /></span>
              <strong><Text ko={older.title} en={older.english?.title ?? older.title} /></strong>
              <time dateTime={older.date}>{formatDate(older.date)}</time>
            </Link>
          )}
        </div>
        <div>
          {newer && (
            <Link href={`/works/${newer.slug}/`}>
              <span><Text ko="다음 기록" en="Next entry" /></span>
              <strong><Text ko={newer.title} en={newer.english?.title ?? newer.title} /></strong>
              <time dateTime={newer.date}>{formatDate(newer.date)}</time>
            </Link>
          )}
        </div>
      </PostNavigation>
      <footer className="post-footer">
        <Link href="/"><Text ko="모든 기록 보기" en="View all entries" /></Link>
      </footer>
    </main>
  );
}
