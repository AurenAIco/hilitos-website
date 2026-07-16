// components/editorial/ThreadMotif.tsx — AMARILLO. The signature thread/stitch
// motif. Purely decorative: aria-hidden, no animation (reduced-motion safe by
// construction). Uses --hilo only.
export function ThreadMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 400 24"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className={`h-6 w-full min-w-0 text-hilo ${className}`}
    >
      <path
        d="M2 12 C 40 3, 78 21, 116 12 S 192 3, 230 12 S 306 21, 344 12 S 388 6, 398 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="7 5"
        strokeLinecap="round"
      />
      <circle cx="230" cy="12" r="2.4" fill="currentColor" />
      <circle cx="398" cy="10" r="1.8" fill="currentColor" />
    </svg>
  );
}
