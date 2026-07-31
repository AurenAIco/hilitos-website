// components/product/FeaturedDesigns.tsx
// VERDE (Gate G5 — storefront catalog connect). "Destacados" rail for the
// /catalogo page, driven by StorefrontDesign.featuredRank (1-6) from the
// live catalog. Reuses Amarillo's shared UI/editorial primitives (Section,
// Container, EditorialHeading, Reveal) — consumption only, no changes to
// those files.
import type { StorefrontDesign } from "@/lib/contract";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { DesignCard } from "@/components/product/DesignCard";

export function FeaturedDesigns({ designs }: { designs: StorefrontDesign[] }) {
  if (designs.length === 0) return null;

  return (
    <Section labelledBy="destacados-titulo" className="border-y border-hairline bg-marfil">
      <EditorialHeading as="h2" id="destacados-titulo" className="text-3xl">
        Piezas destacadas
      </EditorialHeading>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
        {designs.map((design, i) => (
          <li key={design.designRef}>
            <Reveal delayMs={i * 90}>
              <DesignCard design={design} priority={i === 0} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
