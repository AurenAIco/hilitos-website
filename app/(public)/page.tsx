// app/(public)/page.tsx — Homepage (S1 de-fixture pass).
// Server Component. Renders ONLY the approved static editorial/brand content
// plus, optionally, the live StorefrontCatalogV2 featured-designs rail
// (lib/catalog/storefront.ts) — never the V1 fixture (lib/fixture.ts /
// catalog.fixture.json). The rail renders ONLY on a fresh ("ok") fetch: when
// the live catalog is unavailable, when it is "stale" last-good data, or when
// it simply has no featured designs yet, the rail renders nothing and this
// page stays purely editorial. It must never show a synthetic product, and
// never a real price/reference/availability the visitor could believe is
// current when it is not.
// Copy uses only facts already published by the brand on the live site
// (hilitos.co). The named traps ("más de 500 familias", testimonials) are
// deliberately NOT carried over even though the legacy site shows them.
//
// Why "stale" is excluded rather than disclosed here: getStorefrontCatalog()'s
// fallback contract requires every caller that renders "stale" data to show a
// visible last-good indicator (see components/catalog/CatalogStatusBanner.tsx,
// used by /catalogo and /productos/[slug]). The homepage is editorial, not a
// catalog surface, so it opts out of rendering that data at all instead of
// carrying a banner — the honest option that needs no disclosure. Note that
// getStorefrontCatalog() returns a NON-null `catalog` for "stale" too, so the
// gate below must test `status`, not just `catalog`.
import Image from "next/image";
import { getFeaturedDesigns, getStorefrontCatalog } from "@/lib/catalog/storefront";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { ThreadMotif } from "@/components/editorial/ThreadMotif";
import { FeaturedDesigns } from "@/components/product/FeaturedDesigns";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

// Route-segment config: kept numerically identical to lib/catalog/storefront.ts's
// CATALOG_REVALIDATE_SECONDS (same convention as app/(public)/catalogo/page.tsx) —
// if you change one, change both.
export const revalidate = 300;

export default async function HomePage() {
  const result = await getStorefrontCatalog();
  const featured =
    result.status === "ok" && result.catalog
      ? getFeaturedDesigns(result.catalog)
      : [];

  return (
    <main id="contenido">
      {/* 1 · Editorial hero */}
      <Section labelledBy="hero-titulo" className="pt-10 md:pt-14">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="min-w-0 max-w-xl">
            <ThreadMotif className="mb-6 max-w-56" />
            <EditorialHeading as="h1" id="hero-titulo" className="text-display">
              Ajuar tejido con amor para los primeros días
            </EditorialHeading>
            <p className="mt-5 max-w-md text-lg leading-[var(--leading-relaxed)] text-text-muted">
              Prendas suaves y naturales, tejidas a mano para la piel más
              delicada.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/catalogo">Ver el catálogo</Button>
              <WhatsAppCTA />
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
            <Image
              src="/brand/hero.jpg"
              alt="Conjunto de ajuar tejido para bebé sobre manta clara"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </Section>

      {/* 2 · Featured designs (fresh live V2 catalog only; renders nothing
          when the catalog is unavailable, stale, or has no featured designs) */}
      <FeaturedDesigns designs={featured} />

      {/* 3 · Catalog-entry / search visual band (NO search logic — link only) */}
      <Section bleed labelledBy="banda-catalogo-titulo" className="bg-crudo/50">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <EditorialHeading as="h2" id="banda-catalogo-titulo" className="text-2xl">
              El archivo completo, organizado para ti
            </EditorialHeading>
            <p className="mt-2 max-w-md text-sm leading-[var(--leading-relaxed)] text-text-muted">
              Cada prenda vive en el catálogo con su referencia, colores y
              tallas.
            </p>
          </div>
          {/* Visual search affordance: links to /catalogo; implements NO search */}
          <Button
            href="/catalogo"
            variant="secondary"
            className="w-full max-w-sm justify-between bg-marfil md:w-96"
          >
            <span className="text-text-muted">Buscar en el catálogo…</span>
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" className="size-5 text-barro-hondo">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Button>
        </Container>
      </Section>

      {/* 4 · Craft and history */}
      <Section bleed labelledBy="oficio-titulo" className="bg-sage/15">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative order-last aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo md:order-first">
            <Image
              src="/brand/craft-1.jpg"
              alt="Pelele tejido a mano con bordado y gorro con pompón"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="min-w-0 max-w-lg">
            <EditorialHeading as="h2" id="oficio-titulo" className="text-3xl">
              Un legado tejido con amor y tiempo
            </EditorialHeading>
            <p className="mt-4 leading-[var(--leading-relaxed)] text-text-muted">
              Cada ajuar es tejido a mano con fibras naturales seleccionadas
              para la piel más delicada.
            </p>
            <ThreadMotif className="mt-6 max-w-48" />
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/nosotros" variant="ghost">
                Conoce nuestra historia →
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5 · Trust / purchase process (describes the site's own WhatsApp loop) */}
      <Section labelledBy="proceso-titulo">
        <EditorialHeading as="h2" id="proceso-titulo" className="text-3xl">
          Así de simple
        </EditorialHeading>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Explora el catálogo",
              body: "Recorre el archivo de prendas con calma, desde tu celular.",
            },
            {
              title: "Elige tu prenda",
              body: "Cada pieza tiene su referencia, colores y tallas visibles.",
            },
            {
              title: "Escríbenos por WhatsApp",
              body: "Te acompañamos a confirmar la prenda con su referencia.",
            },
          ].map((step, i) => (
            <li key={step.title} className="rounded-lg border border-hairline bg-marfil p-6">
              <span aria-hidden="true" className="font-display text-3xl text-hilo">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-medium text-tinta">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-[var(--leading-relaxed)] text-text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 6 · Neutral craft-quality (NO testimonials/counts — not verified) */}
      <Section bleed labelledBy="calidad-titulo" className="bg-crudo/50">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div className="max-w-lg">
            <EditorialHeading as="h2" id="calidad-titulo" className="text-3xl">
              Cada prenda lleva su referencia
            </EditorialHeading>
            <p className="mt-4 leading-[var(--leading-relaxed)] text-text-muted">
              El archivo de Hilitos se organiza por referencias — como las
              etiquetas colgantes de un taller. La referencia que ves aquí es
              la misma con la que confirmas tu prenda por WhatsApp.
            </p>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
            <Image
              src="/brand/craft-2.jpg"
              alt="Pelele tejido de manga corta con cuello bordado y lazo"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </Container>
      </Section>

      {/* 7 · FAQ (published brand answers only) */}
      <Section labelledBy="faq-titulo">
        <EditorialHeading as="h2" id="faq-titulo" className="text-3xl">
          Preguntas frecuentes
        </EditorialHeading>
        <div className="mt-8 max-w-2xl">
          {[
            {
              q: "¿Cómo compro una prenda?",
              a: "Explora el catálogo, elige la prenda y escríbenos por WhatsApp con su referencia. Te acompañamos en el resto.",
            },
            {
              q: "¿De qué material están hechas las prendas?",
              a: "Fibra natural suave, transpirable y resistente, ideal para la piel sensible del bebé.",
            },
            {
              q: "¿Cómo se lavan?",
              a: "En ciclo delicado con agua fría, sin dejar en remojo, y secado al aire libre para conservar la forma y suavidad de las fibras.",
            },
            {
              q: "¿Qué talla elijo para un recién nacido?",
              a: "La talla RN es ideal para recibir al bebé. Si ya nació, escríbenos y te asesoramos sobre la talla más adecuada.",
            },
          ].map((item) => (
            <details key={item.q} className="group border-b border-hairline">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-tinta [&::-webkit-details-marker]:hidden">
                <span className="font-medium">{item.q}</span>
                <span
                  aria-hidden="true"
                  className="text-xl leading-none text-barro-hondo transition-transform duration-[var(--duration-fast)] group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-[var(--leading-relaxed)] text-text-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* 8 · Final WhatsApp CTA */}
      <Section bleed labelledBy="cta-final-titulo" className="bg-marfil">
        <Container className="flex flex-col items-center border-y border-hairline py-14 text-center">
          <ThreadMotif className="mb-6 max-w-64" />
          <EditorialHeading as="h2" id="cta-final-titulo" className="max-w-xl text-3xl">
            ¿Buscas el ajuar perfecto?
          </EditorialHeading>
          <p className="mt-3 max-w-md text-text-muted">
            Cuéntanos qué necesitas y te ayudamos a elegir la prenda ideal.
          </p>
          <div className="mt-7">
            <WhatsAppCTA />
          </div>
        </Container>
      </Section>
    </main>
  );
}
