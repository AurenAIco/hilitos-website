// components/home/BenefitsStrip.tsx — four-benefit strip directly below the
// hero (2026-08 brand refresh §10, richened per Mónica's pre-PR polish pass).
// Each item pairs a small circular brand icon with a heading and a short
// two-line supporting line, echoing the original site's richer treatment
// while keeping the new brand refresh's restraint (small, quiet badges —
// never oversized decorative icons). Copy is the approved four-benefit set,
// verbatim; supporting copy stays visually subordinate to the heading.
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { getStorefrontSiteImages } from "@/lib/catalog/siteImages";
import { resolveSiteImage } from "@/lib/catalog/resolveSiteImage";

const BENEFITS = [
  {
    title: "100% algodón",
    lines: ["Suave, delicado", "y seguro para su piel"],
    src: "/brand/icons/algodon.png",
    alt: "Icono de un copo de algodón",
    slot: "home_benefit_cotton",
  },
  {
    title: "Hecho artesanalmente",
    lines: ["Con el talento de mujeres", "santandereanas"],
    src: "/brand/icons/hecho-a-mano.jpg",
    alt: "Icono de una mano sosteniendo un corazón",
    slot: "home_benefit_handmade",
  },
  {
    title: "Hecho en Colombia",
    lines: ["Con amor, dedicación", "y tradición"],
    src: "/brand/icons/hecho-en-colombia.jpg",
    alt: "Icono del mapa de Colombia con un corazón",
    slot: "home_benefit_made_in_colombia",
  },
  {
    title: "Envíos a todo el país",
    lines: ["Rápidos y seguros", "a donde estés"],
    src: "/brand/icons/envios.png",
    alt: "Icono de un camión de entregas con un corazón",
    slot: "home_benefit_shipping",
  },
] as const;

export async function BenefitsStrip() {
  // IMG-S8B3 — empty/failed override map resolves every benefit icon back
  // to its bundled src/alt unchanged (see lib/catalog/siteImages.ts).
  const siteImages = await getStorefrontSiteImages();

  return (
    <Section bleed labelledBy="beneficios-titulo" className="border-y border-hairline bg-crudo/40 !py-12">
      <Container>
        <h2 id="beneficios-titulo" className="sr-only">
          Por qué Hilitos
        </h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const image = resolveSiteImage(benefit.slot, benefit.src, benefit.alt, siteImages);
            return (
              <li key={benefit.title} className="flex flex-col items-center gap-3 text-center">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-marfil ring-1 ring-hairline sm:size-20">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="80px"
                    className="object-cover object-center"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium tracking-[0.04em] text-tinta">{benefit.title}</p>
                  <p className="mt-1 text-xs leading-snug text-text-muted">
                    {benefit.lines[0]}
                    <br />
                    {benefit.lines[1]}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
