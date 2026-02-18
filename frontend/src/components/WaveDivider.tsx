/** Thin gradient strip for section separators */
export const GradientStrip = () => (
  <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />
);

export const WaveDivider = () => (
  <div className="relative -mb-px h-16 w-full overflow-hidden">
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <path
        fill="hsl(var(--background))"
        d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,60 1440,40 L1440,80 L0,80 Z"
      />
      <path
        fill="hsl(var(--background))"
        opacity="0.9"
        d="M0,50 C240,10 480,70 720,50 C960,30 1200,70 1440,50 L1440,80 L0,80 Z"
      />
    </svg>
  </div>
);
