import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider, Text } from "../components/Language";

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  adjustFontFallback: false,
  display: "swap",
});
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
});
export const metadata: Metadata = {
  title: { default: "chapdo-darakbang", template: "%s | 찹도 다락방" },
  description:
    "하루에 하나, 좋아하는 것을 만들고 기록합니다. 작은 호기심에서 시작된 작품과 그 뒤의 이야기.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${pretendard.variable}`}>
        <LanguageProvider>
        <a className="skip-link" href="#main">
          <Text ko="본문으로 이동" en="Skip to content" />
        </a>
        {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
