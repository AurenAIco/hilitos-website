// components/ui/AvailabilityBadge.tsx — AMARILLO. 3-state availability badge.
// Labels come EXCLUSIVELY from the single shared map AVAILABILITY_LABELS_ES
// (lib/contract.ts — seeded, pending Mónica approval). made_to_order is a
// NEUTRAL/POSITIVE state, never an error.
import { AVAILABILITY_LABELS_ES, type Availability } from "@/lib/contract";

const STYLES: Record<Availability, { badge: string; dot: string }> = {
  available: { badge: "bg-sage/35 text-tinta", dot: "bg-sage" },
  made_to_order: { badge: "bg-crudo text-tinta", dot: "bg-barro" },
  unavailable: { badge: "border border-hairline bg-transparent text-text-muted", dot: "bg-hairline" },
};

export function AvailabilityBadge({
  availability,
  className = "",
}: {
  availability: Availability;
  className?: string;
}) {
  const s = STYLES[availability];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs ${s.badge} ${className}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-pill ${s.dot}`} />
      {AVAILABILITY_LABELS_ES[availability]}
    </span>
  );
}
