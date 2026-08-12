// components/home/ProcessStrip.tsx — "Del hilo a sus primeros días"
// (2026-08 brand refresh §14). Four approved stages, copy verbatim.
//
// Each stage holds its image in the STAGES constant below so replacing one
// later means swapping ONLY that src string — the component itself never
// needs to change.
//
// CERRAMOS A MANO and CUIDAMOS CADA DETALLE now use real process photography
// supplied by Mónica (pre-PR polish pass, 2026-08). TEJEMOS remains a DRAFT:
// the one supplied knitting-machine photo was placed in HistoryTeaser
// instead (same homepage, more prominent slot, and the more literal request)
// — reusing it here too would duplicate the same image twice in one scroll.
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { Reveal } from "@/components/ui/Reveal";

const STAGES = [
  {
    title: "TEJEMOS",
    body: "Con hilo 100% algodón de la mejor calidad.",
    src: "/brand/hero.jpg", // DRAFT — swap for a second, distinct knitting-machine photo when supplied
    alt: "Prenda tejida en hilo suave para bebé",
  },
  {
    title: "CERRAMOS A MANO",
    body: "Cada pieza es unida con paciencia y dedicación.",
    src: "/brand/proceso-cierre-manual.jpg",
    alt: "Manos cerrando y rematando a mano una prenda tejida rosada",
  },
  {
    title: "CUIDAMOS CADA DETALLE",
    body: "Revisamos y preparamos cada prenda para que llegue perfecta a ti.",
    src: "/brand/proceso-detalle-final.jpg",
    alt: "Manos revisando de cerca el tejido, el bordado y el lazo de una prenda rosada",
  },
  {
    title: "LLEGA A TU BEBÉ",
    body: "Para acompañar sus primeros días y momentos inolvidables.",
    src: "/brand/nosotros.jpg",
    alt: "Bebé recién nacido con prenda y gorro tejidos",
  },
] as const;

export function ProcessStrip() {
  return (
    <Section labelledBy="proceso-titulo">
      <EditorialHeading as="h2" id="proceso-titulo" className="text-3xl">
        Del hilo a sus primeros días
      </EditorialHeading>
      <ol className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
        {STAGES.map((stage, i) => (
          <li key={stage.title} className="min-w-0">
            <Reveal delayMs={i * 90}>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
                <Image
                  src={stage.src}
                  alt={stage.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span aria-hidden="true" className="font-display text-2xl text-barro">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-medium tracking-[0.1em] text-tinta">
                  {stage.title}
                </h3>
              </div>
              <p className="mt-1.5 text-sm leading-[var(--leading-relaxed)] text-text-muted">
                {stage.body}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
