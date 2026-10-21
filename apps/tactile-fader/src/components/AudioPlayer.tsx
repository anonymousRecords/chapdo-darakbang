import type { CSSProperties } from "react";
import { useState } from "react";

interface AudioPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const AudioPlayer = ({ audioRef }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={playerContainerStyle}>
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}music.mp3`}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <button
        onClick={() => {
          if (!audioRef.current) return;
          if (isPlaying) {
            audioRef.current.pause();
          } else {
            audioRef.current.play();
          }
          setIsPlaying(!isPlaying);
        }}
        style={playButtonStyle}
      >
        {isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      <span style={timeStyle}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      <div style={progressContainerStyle}>
        <div style={{ ...progressBarStyle, width: `${progress}%` }} />
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const time = Number(e.target.value);
            if (audioRef.current) {
              audioRef.current.currentTime = time;
              setCurrentTime(time);
            }
          }}
          style={progressInputStyle}
        />
      </div>
    </div>
  );
};

const playerContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "16px 24px",
  backgroundColor: "#f5f5f5",
  borderRadius: "40px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
};

const playButtonStyle: CSSProperties = {
  width: "40px",
  height: "40px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#333",
};

const timeStyle: CSSProperties = {
  fontFamily: "monospace",
  fontSize: "16px",
  color: "#333",
  minWidth: "100px",
};

const progressContainerStyle: CSSProperties = {
  position: "relative",
  width: "200px",
  height: "6px",
  backgroundColor: "#ddd",
  borderRadius: "3px",
};

const progressBarStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  backgroundColor: "#666",
  borderRadius: "3px",
  pointerEvents: "none",
};

const progressInputStyle: CSSProperties = {
  position: "absolute",
  top: "-8px",
  left: 0,
  width: "100%",
  height: "20px",
  opacity: 0,
  cursor: "pointer",
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
