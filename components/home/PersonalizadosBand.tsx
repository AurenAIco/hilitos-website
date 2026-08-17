// components/home/PersonalizadosBand.tsx — Personalizados homepage band
// (2026-08 brand refresh §16). Approved copy verbatim; the CTA routes to the
// /personalizados editorial page, which owns the WhatsApp conversion step.
// Large photography, restrained editorial styling.
//
// DRAFT ASSET: embroidery/personalization photography is not in the repo
// yet — craft-2 (embroidered rosette collar) holds the slot; swap ONLY the
// constant below when the final photo is supplied.
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { getStorefrontSiteImages } from "@/lib/catalog/siteImages";
import { resolveSiteImage } from "@/lib/catalog/resolveSiteImage";

const PERSONALIZADOS_IMAGE = {
  src: "/brand/craft-2.jpg", // DRAFT — swap for name-embroidery photo when supplied
  alt: "Prenda tejida con cuello bordado a mano",
};

export async function PersonalizadosBand() {
  // IMG-S8B3 — empty/failed override map resolves back to
  // PERSONALIZADOS_IMAGE unchanged (see lib/catalog/siteImages.ts).
  const siteImages = await getStorefrontSiteImages();
  const image = resolveSiteImage(
    "home_personalizados_band",
    PERSONALIZADOS_IMAGE.src,
    PERSONALIZADOS_IMAGE.alt,
    siteImages,
  );

  return (
    <Section bleed labelledBy="personalizados-titulo" className="bg-sage/40">
      <Container className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="min-w-0 max-w-lg">
          <p className="text-xs font-medium tracking-[0.18em] text-barro-hondo">
            PERSONALIZADOS
          </p>
          <EditorialHeading as="h2" id="personalizados-titulo" className="mt-3 text-3xl">
            Hazlo aún más especial
          </EditorialHeading>
          <p className="mt-4 leading-[var(--leading-relaxed)] text-text-muted">
            Personalizamos algunas de nuestras prendas con el nombre de tu
            bebé bordado con amor en cada detalle.
          </p>
          <div className="mt-7">
            <Button href="/personalizados" className="tracking-[0.08em]">
              QUIERO PERSONALIZAR
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center"
          />
        </div>
      </Container>
    </Section>
  );
}
