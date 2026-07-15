// components/ui/ColorSwatch.tsx — AMARILLO. Named color chip: the color NAME
// is always programmatically available (never color-only, §11). Without hex,
// renders a name-only chip.
import type { ColorContract } from "@/lib/contract";

export function ColorSwatch({ color, className = "" }: { color: ColorContract; className?: string }) {
  if (!color.hex) {
    return (
      <span
        className={`inline-flex items-center rounded-pill border border-hairline px-2 py-0.5 text-xs text-tinta ${className}`}
      >
        {color.name}
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={color.name}
      title={color.name}
      className={`inline-block size-4 rounded-pill border border-hairline ${className}`}
      style={{ backgroundColor: color.hex }}
    />
  );
}
