export function DefsGreenCircle() {
  return (
    <>
      <radialGradient id="led-green" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgb(0,255,100)" />
        <stop offset="40%" stopColor="rgb(0,180,70)" />
        <stop offset="70%" stopColor="rgb(0,100,40)" />
        <stop offset="100%" stopColor="rgb(0,40,20)" />
      </radialGradient>

      <filter id="led-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </>
  );
}
