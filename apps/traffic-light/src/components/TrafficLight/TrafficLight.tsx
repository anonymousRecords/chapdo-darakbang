import { useEffect, useState } from "react";
import { STAND_DOTS, TRI_LOCAL, WALK_DOTS } from "./constant";
import {
  DefsGreenCircle,
  DefsRedCircle,
  DefsStand,
  DefsTriangles,
  DefsWalk,
} from "./defs";
import trafficFrame from "/traffic-frame.svg";

interface TrafficLightProps {
  phase: string;
}

export function TrafficLight({ phase }: TrafficLightProps) {
  const [blinkTick, setBlinkTick] = useState<number>(0);

  useEffect(() => {
    if (phase !== "GREEN_BLINK") {
      setBlinkTick(0);
      return;
    }

    const interval = setInterval(() => {
      setBlinkTick((prev) => prev + 1);
    }, 400); // 0.4초

    return () => clearInterval(interval);
  }, [phase]);

  const isBlinkOn = phase === "GREEN_BLINK" ? blinkTick % 2 === 0 : false;
  const isGreenOn = phase === "GREEN" || (phase === "GREEN_BLINK" && isBlinkOn);
  const isRedOn = phase === "RED" || phase === "RED2";

  return (
    <svg
      viewBox="0 0 400 600"
      width={100}
      role="img"
      aria-label="Traffic light"
      style={{ zIndex: 1 }}
    >
      <defs>
        <DefsTriangles />
        <DefsWalk />
        <DefsStand />
        <DefsGreenCircle />
        <DefsRedCircle />
      </defs>

      {/* FRAME */}
      <image href={trafficFrame} preserveAspectRatio="xMidYMid meet" />

      {/* TRI */}
      <g clipPath="url(#tri-clip)">
        {Array.from({ length: 8 }).map((_, rowIndex) => {
          const totalRows = 8;

          const rowOpacity = (() => {
            if (phase === "GREEN") return 1;

            if (phase === "GREEN_BLINK") {
              const offCount = Math.min(blinkTick, totalRows);
              return rowIndex < offCount ? 0.1 : 1;
            }

            if (phase === "RED" || phase === "RED2") {
              return 0.1;
            }

            return 0.1;
          })();

          return (
            <g
              //TODO
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={rowIndex}
              transform={`translate(0, ${rowIndex * 50})`}
            >
              {TRI_LOCAL.map((row) =>
                row.map(({ cx, cy }) => (
                  <circle
                    key={`tri-${rowIndex}-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={6}
                    opacity={rowOpacity}
                    fill="url(#led-green)"
                    filter="url(#led-glow)"
                  />
                ))
              )}
            </g>
          );
        })}
      </g>

      {/* WALK */}
      <g clipPath="url(#walk-clip)">
        {WALK_DOTS.map(({ cx, cy, key }) => (
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r={4}
            opacity={isGreenOn ? 1 : 0.2}
            fill="url(#led-green)"
            filter="url(#led-glow)"
          />
        ))}
      </g>

      {/* STAND */}
      <g clipPath="url(#stand-clip)">
        {STAND_DOTS.map(({ cx, cy, key }) => (
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r={6}
            opacity={isRedOn ? 1 : 0.2}
            fill="url(#led-red)"
            filter="url(#led-red-glow)"
          />
        ))}
      </g>
    </svg>
  );
}
