// components/editorial/EditorialHeading.tsx — AMARILLO. Fraunces display
// heading. Accepts `as` (h1–h4) to preserve one-h1-per-page and logical order.
import type { ReactNode } from "react";

type Level = "h1" | "h2" | "h3" | "h4";

export function EditorialHeading({
  as: Tag = "h2",
  children,
  id,
  className = "",
}: {
  as?: Level;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <Tag
      id={id}
      className={`font-display font-medium leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-tinta ${className}`}
    >
      {children}
    </Tag>
  );
}
