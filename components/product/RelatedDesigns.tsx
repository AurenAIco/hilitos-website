// components/product/RelatedDesigns.tsx — "También te puede interesar" rail
// for /productos/[slug] (Slice C, final pre-launch value pass). Same shape
// as components/product/FeaturedDesigns.tsx: reuses shared editorial/UI
// primitives and DesignCard, renders nothing when there is nothing to show
// (a category of one has no related designs — that is not an error state).
import type { StorefrontDesign } from "@/lib/contract";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { DesignCard } from "@/components/product/DesignCard";

export function RelatedDesigns({ designs }: { designs: StorefrontDesign[] }) {
  if (designs.length === 0) return null;

  return (
    <Section labelledBy="relacionados-titulo" className="border-t border-hairline">
      <EditorialHeading as="h2" id="relacionados-titulo" className="text-2xl">
        También te puede interesar
      </EditorialHeading>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {designs.map((design, i) => (
          <li key={design.designRef}>
            <Reveal delayMs={i * 90}>
              <DesignCard design={design} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
