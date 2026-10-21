import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DesktopOnly } from "@repo/ui/desktop-only";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesktopOnly message="데스크탑 환경에서만 접속 가능해요.">
      <App />
    </DesktopOnly>
  </StrictMode>
);
