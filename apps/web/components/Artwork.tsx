"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLanguage, Text } from "./Language";

export function Artwork({
  title,
  englishTitle,
  url,
  desktopOnly,
  children,
}: {
  title: string;
  englishTitle?: string;
  url?: string;
  children?: ReactNode;
  desktopOnly: boolean;
}) {
  const { locale } = useLanguage();
  const displayTitle = locale === "en" ? englishTitle ?? title : title;
  const [isDesktop, setIsDesktop] = useState(false);
  const canPlay = !desktopOnly || isDesktop;
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section className="artwork" aria-label={`${displayTitle} ${locale === "ko" ? "작품" : "artwork"}`}>
      {canPlay ? (
        <>
          {url ? (
            <iframe
              src={url}
              title={`${displayTitle} ${locale === "ko" ? "인터랙션" : "interaction"}`}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            children
          )}
          <div className="artwork-toolbar">
            <span><Text ko="직접 움직여 보세요." en="Try interacting with it." /></span>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Text ko="작품만 크게 보기" en="Open artwork" />
              </a>
            )}
          </div>
        </>
      ) : (
        <div className="artwork-notice">
          <p><Text ko="이 작품은 데스크탑에서 체험할 수 있어요." en="This artwork is best experienced on a desktop." /></p>
          <span><Text ko="작품을 만든 이야기는 아래에서 읽어 주세요." en="Read the story behind it below." /></span>
        </div>
      )}
    </section>
  );
}
