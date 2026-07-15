// components/ui/Section.tsx — AMARILLO. Semantic section + vertical rhythm.
import type { ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  children,
  id,
  labelledBy,
  className = "",
  bleed = false,
}: {
  children: ReactNode;
  id?: string;
  /** id of the heading that names this section (aria-labelledby). */
  labelledBy?: string;
  className?: string;
  /** true = full-bleed (caller manages its own container). */
  bleed?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`py-[var(--section-y)] ${className}`}>
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
