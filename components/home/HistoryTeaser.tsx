// components/home/HistoryTeaser.tsx — short home history introduction
// (2026-08 brand refresh §12). Copy is the approved text, verbatim. The CTA
// routes to the dedicated Nuestra historia page (/nosotros — canonical URL
// unchanged).
//
// DRAFT ASSET: the approved direction asks for an artisanal work / knitting
// machine photograph here. No such photo exists in the repo yet, so the
// closest local approved image (craft-1: visible hand-smocked stitchwork)
// holds the slot. Replacing it later means changing ONLY the constant below.
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";

const HISTORY_IMAGE = {
  src: "/brand/craft-1.jpg", // DRAFT — swap for the knitting-machine/artisanal photo when supplied
  alt: "Detalle de prenda tejida con bordado artesanal",
};

export function HistoryTeaser() {
  return (
    <Section bleed labelledBy="historia-corta-titulo" className="bg-crudo/40">
      <Container className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="relative order-last aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo md:order-first">
          <Image
            src={HISTORY_IMAGE.src}
            alt={HISTORY_IMAGE.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="min-w-0 max-w-lg">
          <p className="text-xs font-medium tracking-[0.18em] text-barro-hondo">
            DETRÁS DE CADA HILITOS
          </p>
          <EditorialHeading as="h2" id="historia-corta-titulo" className="mt-3 text-3xl">
            Hay una historia
          </EditorialHeading>
          <p className="mt-4 leading-[var(--leading-relaxed)] text-text-muted">
            Cada prenda comienza entre hilos y manos de mujeres santandereanas
            que, con experiencia y dedicación, transforman cada pieza en una
            prenda especial para los primeros días de un bebé.
          </p>
          <div className="mt-7">
            <Button href="/nosotros" variant="secondary" className="tracking-[0.08em]">
              CONOCE NUESTRA HISTORIA
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
