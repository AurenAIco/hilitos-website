// app/nosotros/page.tsx — "Nuestra historia" (2026-08 brand refresh §13).
// The nav's "Nuestra historia" item keeps this existing /nosotros route so
// the canonical URL never changes.
//
// COPY RULE: every paragraph below is the OWNER-APPROVED brand-history text
// supplied verbatim by Mónica/Juanpa for the 2026-08 redesign (including the
// "más de 30 años" figure and the Ximena/Mónica generational narrative that
// earlier slices had removed as unverified — it is now the approved account,
// see tests/amarillo/s4-legal-about.test.ts). Do not invent additional
// history, names, or factual claims; do not change the approved wording.
// The text is distributed into readable editorial sections rather than one
// wall of text — section headings are drawn from the copy itself.
import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { MascotSlot } from "@/components/editorial/MascotSlot";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { buildGenericWhatsAppHref } from "@/lib/whatsapp";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";
import { getStorefrontSiteImages } from "@/lib/catalog/siteImages";
import { resolveSiteImage } from "@/lib/catalog/resolveSiteImage";

export const metadata: Metadata = {
  title: "Nuestra historia",
  // Reuses the page's own approved opening copy — no new claim invented for
  // SEO purposes.
  description:
    "Hilitos es una empresa familiar santandereana que nació hace más de 30 años con el sueño de crear prendas especiales para acompañar los primeros días de vida de un bebé.",
  alternates: {
    canonical: `${resolveSiteUrl().origin}/nosotros`,
  },
};

// DRAFT ASSETS: the process/material sections call for knitting-machine and
// yarn photography that is not in the repo yet. The closest approved local
// images hold the slots — replacing one later means changing ONLY this
// constant, not the sections below.
const HISTORIA_IMAGES = {
  hero: {
    src: "/brand/nosotros.jpg",
    alt: "Bebé recién nacido con pijama y gorro tejidos",
  },
  proceso: {
    src: "/brand/craft-1.jpg", // DRAFT — swap for tejedoras/cerradoras photo when supplied
    alt: "Detalle de prenda tejida con bordado artesanal",
  },
  material: {
    src: "/brand/craft-2.jpg", // DRAFT — swap for hilo/algodón photo when supplied
    alt: "Prenda tejida en algodón con cuello bordado",
  },
} as const;

export default async function NosotrosPage() {
  // IMG-S8B3 — empty/failed override map resolves every image below back to
  // its bundled HISTORIA_IMAGES entry unchanged (see lib/catalog/siteImages.ts).
  const siteImages = await getStorefrontSiteImages();
  const heroImage = resolveSiteImage("nosotros_hero", HISTORIA_IMAGES.hero.src, HISTORIA_IMAGES.hero.alt, siteImages);
  const procesoImage = resolveSiteImage(
    "nosotros_process",
    HISTORIA_IMAGES.proceso.src,
    HISTORIA_IMAGES.proceso.alt,
    siteImages,
  );
  const materialImage = resolveSiteImage(
    "nosotros_material",
    HISTORIA_IMAGES.material.src,
    HISTORIA_IMAGES.material.alt,
    siteImages,
  );

  return (
    <main id="contenido" tabIndex={-1}>
      {/* Apertura */}
      <Section labelledBy="nosotros-titulo" className="pt-10 md:pt-14">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="min-w-0 max-w-xl">
            <p className="text-xs font-medium tracking-[0.18em] text-barro-hondo">
              NUESTRA HISTORIA
            </p>
            <EditorialHeading as="h1" id="nosotros-titulo" className="mt-3 text-display">
              Más de 30 años tejiendo historias
            </EditorialHeading>
            {/* Kept on one source line: tests/integration/s7b-route-metadata
                verifies the metadata description appears verbatim here. */}
            <p className="mt-6 max-w-md text-lg leading-[var(--leading-relaxed)] text-text-muted">
              Hilitos es una empresa familiar santandereana que nació hace más de 30 años con el sueño de crear prendas especiales para acompañar los primeros días de vida de un bebé.
            </p>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </Section>

      {/* Un legado que continúa */}
      <Section bleed labelledBy="legado-titulo" className="bg-crudo/40">
        <Container className="max-w-3xl">
          <EditorialHeading as="h2" id="legado-titulo" className="text-3xl">
            Un legado que continúa
          </EditorialHeading>
          <p className="mt-5 leading-[var(--leading-relaxed)] text-text-muted">
            Con el paso de los años, ese sueño fue creciendo entre hilos,
            tejidos y manos artesanas, hasta convertirse en un legado familiar
            que hoy continúa en una nueva generación.
          </p>
          <p className="mt-4 leading-[var(--leading-relaxed)] text-text-muted">
            Actualmente, Hilitos está en manos de las dos hermanas Ximena y
            Mónica, quienes han asumido con cariño y compromiso la tarea de
            conservar la esencia con la que nació la marca, mientras le dan
            una mirada renovada para seguir acompañando a nuevas familias.
          </p>
        </Container>
      </Section>

      {/* El proceso artesanal */}
      <Section labelledBy="proceso-artesanal-titulo">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="relative order-last aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo md:order-first">
            <Image
              src={procesoImage.src}
              alt={procesoImage.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="min-w-0 max-w-lg">
            <EditorialHeading as="h2" id="proceso-artesanal-titulo" className="text-3xl">
              El proceso artesanal
            </EditorialHeading>
            <p className="mt-5 leading-[var(--leading-relaxed)] text-text-muted">
              Cada prenda de Hilitos tiene detrás un proceso artesanal.
              Mujeres santandereanas, muchas de ellas cabeza de familia,
              trabajan nuestras máquinas tejedoras para transformar el hilo en
              delicadas piezas. Luego, nuestras cerradoras unen y terminan
              cada una manualmente, cuidando cada detalle antes de que llegue
              a su destino.
            </p>
          </div>
        </div>
      </Section>

      {/* Tejido 100% algodón */}
      <Section bleed labelledBy="material-titulo" className="bg-sage/40">
        <Container className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="min-w-0 max-w-lg">
            <EditorialHeading as="h2" id="material-titulo" className="text-3xl">
              Tejido 100% algodón
            </EditorialHeading>
            <p className="mt-5 leading-[var(--leading-relaxed)] text-text-muted">
              Trabajamos con tejido 100% algodón, en colores cuidadosamente
              seleccionados para crear prendas suaves y especiales para recién
              nacidos y bebés de 0, 3 y 6 meses.
            </p>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
            <Image
              src={materialImage.src}
              alt={materialImage.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </Container>
      </Section>

      {/* Cierre emocional */}
      <Section labelledBy="cierre-titulo">
        <div className="mx-auto max-w-3xl text-center">
          <EditorialHeading as="h2" id="cierre-titulo" className="text-3xl">
            Mucho más que una prenda
          </EditorialHeading>
          <p className="mt-5 leading-[var(--leading-relaxed)] text-text-muted">
            Así, detrás de cada Hilitos hay mucho más que una prenda: hay más
            de tres décadas de experiencia, una familia, mujeres que trabajan
            con sus manos y un legado que continúa tejiéndose generación tras
            generación.
          </p>
          <p className="mt-4 leading-[var(--leading-relaxed)] text-text-muted">
            Porque cada vez que una mamá viste a su bebé con Hilitos, o
            alguien nos elige para regalar un detalle especial, una pequeña
            parte de nuestra historia pasa a formar parte de la suya.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <MascotSlot />
            <p className="font-display text-3xl font-semibold text-tinta">Hilitos</p>
            <p className="text-sm italic text-text-muted">
              Un legado familiar tejido con amor.
            </p>
          </div>
        </div>
      </Section>

      {/* CTA de cierre */}
      <Section bleed labelledBy="volver-titulo" className="bg-crudo/50">
        <div className="mx-auto flex w-full max-w-page flex-col items-center px-[var(--container-gutter)] text-center">
          <EditorialHeading as="h2" id="volver-titulo" className="text-2xl">
            Conoce nuestras prendas
          </EditorialHeading>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            Explora el catálogo o escríbenos directamente.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button href="/catalogo" className="tracking-[0.08em]">
              VER COLECCIÓN
            </Button>
            <WhatsAppCTA href={buildGenericWhatsAppHref()} analyticsSource="nosotros" />
          </div>
        </div>
      </Section>
    </main>
  );
}
