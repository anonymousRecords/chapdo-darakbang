"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useLanguage, Text } from "./Language";
import { Drawer } from "vaul";
import styles from "./WorkSheet.module.css";

const PREVIEW = 0.65;
const SNAP_POINTS = [PREVIEW, 1];

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
  const [snap, setSnap] = useState<number | string | null>(PREVIEW);



  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setSnap(PREVIEW);
      }}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      fadeFromIndex={0}
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
            setSnap(PREVIEW);
            setOpen(true);
          }}
          aria-label={`${date.slice(2)} · ${displayTitle}${unpublished ? (locale === "ko" ? " · 미공개" : " · Unpublished") : ""}`}
        >
          <time dateTime={date}>{date.slice(2)}</time>
        </Link>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content className={styles.sheet} data-expanded={snap === 1} aria-describedby={undefined}>
          <Drawer.Handle className={styles.handle} preventCycle aria-label={locale === "ko" ? "바텀시트 높이 조절" : "Resize preview panel"} />
          <header className={styles.header}>
            <div>
              <Drawer.Title className={styles.title}>{displayTitle}</Drawer.Title>
              <time dateTime={date}>{date.slice(2)}</time>
              {unpublished && <span className="draft-label"><Text ko="미공개 미리보기" en="Unpublished preview" /></span>}
            </div>
          </header>
          <div className={styles.body} data-vaul-no-drag>
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
