// app/nosotros/page.tsx — Heritage page (AMARILLO, HILITOS-P1A-AMARILLO §6D).
// Copy uses ONLY facts already published by the brand on the live site plus
// clearly-marked placeholders. No founding dates, family names, "más de 40
// años", or process claims are invented (§13).
import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { ThreadMotif } from "@/components/editorial/ThreadMotif";
import { PendingBlock } from "@/components/editorial/PendingBlock";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

export const metadata: Metadata = {
  title: "Nosotros",
};

export default function NosotrosPage() {
  return (
    <main id="contenido">
      <Section labelledBy="nosotros-titulo" className="pt-10 md:pt-14">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-14">
          <div className="max-w-xl">
            <ThreadMotif className="mb-6 max-w-56" />
            <EditorialHeading as="h1" id="nosotros-titulo" className="text-display">
              Un legado tejido con amor y tiempo
            </EditorialHeading>
            <p className="mt-5 max-w-md text-lg leading-[var(--leading-relaxed)] text-text-muted">
              Hilitos es un taller de ajuar artesanal para bebés en
              Bucaramanga, Colombia. Cada ajuar es tejido a mano con fibras
              naturales seleccionadas para la piel más delicada.
            </p>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
            <Image
              src="/brand/nosotros.jpg"
              alt="Bebé recién nacido con pijama y gorro tejidos"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </Section>

      <Section labelledBy="historia-titulo" className="pt-0">
        <div className="max-w-2xl">
          <EditorialHeading as="h2" id="historia-titulo" className="text-3xl">
            Cada prenda, una historia
          </EditorialHeading>
          <PendingBlock className="mt-5">
            Historia de la marca: origen, años de oficio (p. ej. el marco
            «más de 40 años»), tradición familiar y proceso del taller. No se
            publica ninguna afirmación sin el copy aprobado.
          </PendingBlock>
        </div>
      </Section>

      <Section bleed labelledBy="volver-titulo" className="bg-crudo/50">
        <div className="mx-auto flex w-full max-w-page flex-col items-center px-[var(--container-gutter)] text-center">
          <EditorialHeading as="h2" id="volver-titulo" className="text-2xl">
            Conoce el archivo
          </EditorialHeading>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            Explora las prendas del taller o escríbenos directamente.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button href="/catalogo">Ver el catálogo</Button>
            <WhatsAppCTA />
          </div>
        </div>
      </Section>
    </main>
  );
}
