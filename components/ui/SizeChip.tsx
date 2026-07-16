// components/ui/SizeChip.tsx — AMARILLO. Presentational size label (e.g.
// "0-3m"). Not a selector; no logic (flat variants, mission pack §9.4).
export function SizeChip({ size, className = "" }: { size: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border border-hairline px-2 py-0.5 text-xs text-tinta ${className}`}
    >
      {size}
    </span>
  );
}
