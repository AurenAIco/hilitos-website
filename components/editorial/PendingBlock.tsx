// components/editorial/PendingBlock.tsx — AMARILLO. Explicit, visually-marked
// review placeholder for content pending Mónica approval (mission pack §13).
// NEVER replace with believable production copy without approval.
import type { ReactNode } from "react";

export function PendingBlock({
  children,
  className = "",
}: {
  /** Short description of the pending decision/content. */
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-dashed border-barro bg-crudo/40 px-4 py-3 text-sm text-text-muted ${className}`}
    >
      <span className="font-medium text-barro-hondo">⟨PENDIENTE — revisión Mónica⟩</span>{" "}
      {children}
    </div>
  );
}
