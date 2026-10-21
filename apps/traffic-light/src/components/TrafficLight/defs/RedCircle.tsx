export function DefsRedCircle() {
  return (
    <>
      <radialGradient id="led-red" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgb(255,60,60)" />
        <stop offset="40%" stopColor="rgb(180,30,30)" />
        <stop offset="70%" stopColor="rgb(100,15,15)" />
        <stop offset="100%" stopColor="rgb(40,5,5)" />
      </radialGradient>

      <filter id="led-red-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </>
  );
}
