"use client";

import Image, { type ImageProps } from "next/image";
import { useLanguage } from "./Language";

export function PreviewImage({ title, englishTitle, ...props }: Omit<ImageProps, "alt" | "title"> & { title: string; englishTitle: string }) {
  const { locale } = useLanguage();
  return <Image {...props} alt={locale === "ko" ? `${title} 동작 미리보기` : `${englishTitle} — animation preview`} />;
}
