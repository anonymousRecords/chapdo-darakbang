"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import localFont from "next/font/local";
import { useLanguage, Text } from "./Language";
import { Drawer } from "vaul";
import styles from "./WorkSheet.module.css";

const handwriting = localFont({
  src: "../app/fonts/KyoboHandwriting2023wsa.ttf",
  variable: "--font-note-handwriting",
  weight: "400",
  display: "swap",
  preload: false,
});
const myeongjo = localFont({
  src: "../app/fonts/GowunBatang-Regular.ttf",
  variable: "--font-note-body",
  weight: "400",
  display: "swap",
  preload: false,
});

function PaperTexture() {
  const texture = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(24);

  useEffect(() => {
    const element = texture.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const row = element.querySelector<HTMLElement>("[data-paper-row]");
      const step = row?.getBoundingClientRect().height ?? 30;
      setRows(Math.ceil(element.clientHeight / Math.max(step, 1)) + 1);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={texture} className={styles.paperTexture} aria-hidden="true">
    <div className={styles.paperTop} />
    <div className={styles.paperMiddle}>
      {Array.from({ length: rows }, (_, index) => <div key={index} data-paper-row className={styles.paperRow} />)}
    </div>
    <div className={styles.paperBottom} />
  </div>;
}

export function WorkSheet({ slug, date, title, englishTitle, unpublished, className, children }: {
  slug: string;
  date: string;
  title: string;
  englishTitle?: string;
  unpublished: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { locale } = useLanguage();
  const displayTitle = locale === "en" ? englishTitle ?? title : title;
  const href = `/works/${slug}/`;
  const [open, setOpen] = useState(false);




  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      handleOnly
      autoFocus
    >
      <Drawer.Trigger asChild>
        <Link
          className={className}
          href={href}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
              event.stopPropagation();
              return;
            }
            event.preventDefault();
            setOpen(true);
          }}
          aria-label={`${date.slice(2)} · ${displayTitle}${unpublished ? (locale === "ko" ? " · 미공개" : " · Unpublished") : ""}`}
        >
          <time dateTime={date}>{date.slice(2)}</time>
        </Link>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content
          className={styles.reader}
          aria-describedby={undefined}
          data-vaul-no-drag
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className={`${styles.sheet} ${handwriting.variable} ${myeongjo.variable}`}>
          <PaperTexture />
          <header className={styles.header}>
            <div>
              <Drawer.Title className={styles.title}>{displayTitle}</Drawer.Title>
              <time dateTime={date}>{date.slice(2)}</time>
              {unpublished && <span className="draft-label"><Text ko="미공개 미리보기" en="Unpublished preview" /></span>}
            </div>
          </header>
          <div className={styles.body}>
            {children}
          </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
