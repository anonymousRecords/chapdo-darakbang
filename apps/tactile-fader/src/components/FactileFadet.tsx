import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

const FADER_HEIGHT = 300;
const HANDLE_HEIGHT = 60;
const SNAP_INTERVAL = 15;

interface FactileFaderProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const FactileFader = ({ audioRef }: FactileFaderProps) => {
  const prevStepRef = useRef<number>(0);
  const dragStartY = useRef<number>(0);
  const y = useMotionValue(0);

  const steppedY = useTransform(y, (latest: number) => {
    const currentStep = Math.round(latest / SNAP_INTERVAL);

    if (prevStepRef.current !== currentStep) {
      if ("vibrate" in navigator) navigator.vibrate(2);
      prevStepRef.current = currentStep;
    }

    return currentStep * SNAP_INTERVAL;
  });

  useEffect(() => {
    const maxY = FADER_HEIGHT - HANDLE_HEIGHT;
    const unsubscribe = steppedY.on("change", (latest) => {
      if (audioRef.current) {
        const volume = 1 - latest / maxY;
        audioRef.current.volume = Math.max(0, Math.min(1, volume));
      }
    });

    return () => unsubscribe();
  }, [steppedY]);

  return (
    <div style={containerStyle}>
      <div style={trackStyle}>
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} style={{ ...tickStyle, top: `${i * 10}%` }} />
        ))}

        <motion.div
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragStartY.current = e.clientY - y.get();
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              const maxY = FADER_HEIGHT - HANDLE_HEIGHT;
              const newY = e.clientY - dragStartY.current;
              y.set(Math.max(0, Math.min(maxY, newY)));
            }
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          style={{
            y: steppedY,
            ...handleWrapperStyle,
          }}
          whileTap={{
            scale: 0.96,
            filter: "brightness(0.9)",
          }}
        >
          <div style={handleBodyStyle}>
            <div style={concaveGrooveStyle} />
            <div style={indicatorLineStyle} />
          </div>
        </motion.div>
      </div>

      <div style={volumeLabelStyle}>VOL</div>
    </div>
  );
};

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px",
  backgroundColor: "#121212",
  borderRadius: "12px",
  gap: "16px",
};

const trackStyle: CSSProperties = {
  width: "16px",
  height: FADER_HEIGHT,
  backgroundColor: "#080808",
  borderRadius: "8px",
  position: "relative",
  border: "2px solid #222",
  boxShadow: "inset 4px 4px 10px #000",
};

const tickStyle: CSSProperties = {
  position: "absolute",
  right: "-25px",
  width: "12px",
  height: "2px",
  backgroundColor: "#444",
  pointerEvents: "none",
};

const handleWrapperStyle = {
  width: "60px",
  height: HANDLE_HEIGHT,
  position: "absolute" as const,
  left: "-24px",
  cursor: "grab" as const,
  zIndex: 20,
};

const handleBodyStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  background: "linear-gradient(145deg, #e6e6e6, #999)",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  boxShadow: `
    0 10px 20px rgba(0,0,0,0.5),
    inset 0 2px 2px rgba(255,255,255,0.8),
    inset 0 -2px 5px rgba(0,0,0,0.3)
  `,
};

const concaveGrooveStyle: CSSProperties = {
  width: "80%",
  height: "60%",
  backgroundColor: "#bbb",
  borderRadius: "4px",
  boxShadow:
    "inset 2px 5px 10px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.5)",
  position: "absolute",
};

const indicatorLineStyle: CSSProperties = {
  width: "100%",
  height: "3px",
  backgroundColor: "#333",
  opacity: 0.6,
  zIndex: 5,
  boxShadow: "0 1px 1px rgba(255,255,255,0.3)",
};

const volumeLabelStyle: CSSProperties = {
  color: "#666",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "2px",
};
