import { LanguageSwitch, DateList } from "../components/Language";
import { WorkSheet } from "../components/WorkSheet";
import { WorkPreview } from "../components/WorkPreview";
import { getPosts } from "../lib/posts";
import styles from "./page.module.css";

export default function Page() {
  const posts = getPosts();

  return (
    <main id="main" className={styles.journal}>
      <header className={styles.heading}>
        <h1 className={styles.title}>chapdo-darakbang</h1>
        <LanguageSwitch />
      </header>
      <DateList className={styles.dates}>
        {posts.map((post) => (
          <li key={post.slug}>
            <WorkSheet
              slug={post.slug}
              title={post.title}
              englishTitle={post.english?.title}
              date={post.date}
              unpublished={post.unpublished}
              className={styles.date}
            >
              <WorkPreview post={post} />
            </WorkSheet>
          </li>
        ))}
      </DateList>
    </main>
  );
}
