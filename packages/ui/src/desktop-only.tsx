"use client";

import { ReactNode, useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isInIframe()) return;

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

interface DesktopOnlyProps {
  children: ReactNode;
  message?: string;
}

export function DesktopOnly({
  children,
  message = "이 페이지는 데스크탑에서만 이용 가능합니다.",
}: DesktopOnlyProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "20px",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: "18px", color: "#333" }}>{message}</p>
      </div>
    );
  }

  return <>{children}</>;
}
