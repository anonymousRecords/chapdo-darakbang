"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Locale = "en" | "ko";
const LanguageContext = createContext<{ locale: Locale; select: (locale: Locale) => void }>({ locale: "ko", select: () => {} });
export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ko");
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("chapdo-language"); } catch { /* Storage can be disabled. */ }
    setLocale(saved === "en" || saved === "ko" ? saved : navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en");
  }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const select = (next: Locale) => {
    setLocale(next);
    try { localStorage.setItem("chapdo-language", next); } catch { /* Keep switching available without storage. */ }
  };
  return <LanguageContext.Provider value={{ locale, select }}>{children}</LanguageContext.Provider>;
}

export function LanguageSwitch() {
  const { locale, select } = useLanguage();
  return (
    <div className="language-switch" role="group" aria-label={locale === "ko" ? "언어 선택" : "Language"}>
      <button type="button" lang="en" aria-label="English" aria-pressed={locale === "en"} onClick={() => select("en")}>en</button>
      <span aria-hidden="true">/</span>
      <button type="button" lang="ko" aria-label="한국어" aria-pressed={locale === "ko"} onClick={() => select("ko")}>ko</button>
    </div>
  );
}

export function Text({ ko, en }: { ko: string; en: string }) {
  return <>{useLanguage().locale === "ko" ? ko : en}</>;
}

export function Story({ ko, en }: { ko: ReactNode; en: ReactNode }) {
  const { locale } = useLanguage();
  const heading = locale === "ko" ? "왜 만들었는지" : "Why I made this";
  return <article className="post-story" aria-label={heading}><h2>{heading}</h2>{locale === "ko" ? ko : en}</article>;
}

export function PostNavigation({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  return <nav className="post-navigation" aria-label={locale === "ko" ? "이전·다음 작품" : "Previous and next artworks"}>{children}</nav>;
}

export function DateList({ children, className }: { children: ReactNode; className?: string }) {
  const { locale } = useLanguage();
  return <ul className={className} aria-label={locale === "ko" ? "날짜별 작품 기록" : "Artworks by date"}>{children}</ul>;
}

export function DocumentTitle({ ko, en }: { ko: string; en: string }) {
  const { locale } = useLanguage();
  useEffect(() => { document.title = locale === "ko" ? ko : en; }, [locale, ko, en]);
  return null;
}
