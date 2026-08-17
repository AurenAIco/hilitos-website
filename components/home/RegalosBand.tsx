// components/home/RegalosBand.tsx — "Regalos para bebé" homepage band
// (2026-08 brand refresh §17). Approved copy verbatim. HARD INVARIANT: the
// CTA connects ONLY through the existing frontend category surface — the
// frozen "ajuares-y-estuches" /colecciones route (lib/contract.ts) — no new
// backend category, no data remap.
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { getStorefrontSiteImages } from "@/lib/catalog/siteImages";
import { resolveSiteImage } from "@/lib/catalog/resolveSiteImage";

const REGALOS_IMAGE = {
  src: "/brand/hero.jpg", // DRAFT — swap for gift/ajuar packaging photo when supplied
  alt: "Conjunto de ajuar tejido para bebé sobre manta clara",
};

export async function RegalosBand() {
  // IMG-S8B3 — empty/failed override map resolves back to REGALOS_IMAGE
  // unchanged (see lib/catalog/siteImages.ts).
  const siteImages = await getStorefrontSiteImages();
  const image = resolveSiteImage("home_regalos_band", REGALOS_IMAGE.src, REGALOS_IMAGE.alt, siteImages);

  return (
    <Section labelledBy="regalos-titulo">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="relative order-last aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo md:order-first">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="min-w-0 max-w-lg">
          <p className="text-xs font-medium tracking-[0.18em] text-barro-hondo">
            REGALOS PARA BEBÉ
          </p>
          <EditorialHeading as="h2" id="regalos-titulo" className="mt-3 text-3xl">
            Un regalo para recordar sus primeros días
          </EditorialHeading>
          <p className="mt-4 leading-[var(--leading-relaxed)] text-text-muted">
            Nuestros ajuares y detalles son el regalo perfecto para celebrar
            una nueva vida.
          </p>
          <div className="mt-7">
            <Button href="/colecciones/ajuares-y-estuches" variant="secondary" className="tracking-[0.08em]">
              VER REGALOS
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
