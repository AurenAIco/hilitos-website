// components/ui/ImagePlaceholder.tsx — AMARILLO. Branded missing-image
// fallback: textile-weave SVG + wordmark on --crudo, fixed 4:5, accessible
// name = product name. Never a broken <img>, never layout shift (§9.4).
export function ImagePlaceholder({
  name,
  fill = false,
  className = "",
}: {
  /** Product name — becomes the accessible name of the placeholder. */
  name: string;
  /** true when rendered inside an aspect-ratio container (absolute fill). */
  fill?: boolean;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={name}
      className={`${fill ? "absolute inset-0 h-full w-full" : "relative aspect-[4/5] w-full"} overflow-hidden bg-crudo ${className}`}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 80 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full text-hilo opacity-25"
      >
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 8} y1="0" x2={(i + 1) * 8} y2="100" stroke="currentColor" strokeWidth="0.6" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={(i + 1) * 8.3} x2="80" y2={(i + 1) * 8.3} stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 2" />
        ))}
      </svg>
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center font-display text-lg text-barro-hondo/70"
      >
        Hilitos
      </span>
    </div>
  );
}
