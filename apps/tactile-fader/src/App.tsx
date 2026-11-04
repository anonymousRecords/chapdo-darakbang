import { useRef, type CSSProperties } from "react";
import { AudioPlayer } from "./components/AudioPlayer";
import { FactileFader } from "./components/FactileFadet";

export const App = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div style={pageStyle}>
      <FactileFader audioRef={audioRef} />
      <AudioPlayer audioRef={audioRef} />
    </div>
  );
};

const pageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",
  gap: "40px",
};
