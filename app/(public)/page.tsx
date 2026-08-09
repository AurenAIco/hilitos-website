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
// (hilitos.co). The named trap ("más de 500 familias" and the legacy site's
// invented names/cities/star ratings) is deliberately NOT carried over. A
// testimonios section (§7) DOES exist below, but only as an explicitly
// labelled PLACEHOLDER (no invented name, city, rating, or count) pending
// real client content — see the comment at that section for detail.
//
// Why "stale" is excluded rather than disclosed here: getStorefrontCatalog()'s
// fallback contract requires every caller that renders "stale" data to show a
// visible last-good indicator (see components/catalog/CatalogStatusBanner.tsx,
// used by /catalogo and /productos/[slug]). The homepage is editorial, not a
// catalog surface, so it opts out of rendering that data at all instead of
// carrying a banner — the honest option that needs no disclosure. Note that
// getStorefrontCatalog() returns a NON-null `catalog` for "stale" too, so the
// gate below must test `status`, not just `catalog`.
import type { Metadata } from "next";
import Image from "next/image";
import { getFeaturedDesigns, getStorefrontCatalog } from "@/lib/catalog/storefront";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { ThreadMotif } from "@/components/editorial/ThreadMotif";
import { FeaturedDesigns } from "@/components/product/FeaturedDesigns";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { buildGenericWhatsAppHref } from "@/lib/whatsapp";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";

// Route-segment config: kept numerically identical to lib/catalog/storefront.ts's
// CATALOG_REVALIDATE_SECONDS (same convention as app/(public)/catalogo/page.tsx) —
// if you change one, change both.
export const revalidate = 300;

// S7B route metadata closure. `title.absolute` (not a plain string) bypasses
// app/(public)/layout.tsx's "%s · Hilitos" template — a plain string here
// would render as "…Hilitos · Hilitos". Description reuses copy already
// approved and live elsewhere on this same page/Footer (Bucaramanga origin,
// hand-woven material) — no new claim invented for SEO purposes.
export const metadata: Metadata = {
  title: { absolute: "Hilitos — Ajuar artesanal tejido a mano para bebés" },
  description:
    "Ajuar artesanal tejido a mano para bebés en Bucaramanga, Colombia. Prendas suaves y naturales, ideales para la piel más delicada.",
  alternates: {
    canonical: resolveSiteUrl().origin,
  },
};

export default async function HomePage() {
  const result = await getStorefrontCatalog();
  const featured =
    result.status === "ok" && result.catalog
      ? getFeaturedDesigns(result.catalog)
      : [];

  return (
    <main id="contenido" tabIndex={-1}>
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
              <WhatsAppCTA href={buildGenericWhatsAppHref()} analyticsSource="home_hero" />
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

      {/* 7 · Testimonios — PLACEHOLDER content pending real client
          testimonials (Mónica review). Cards are visibly marked "CAMBIAR"
          and carry no name, city, rating, or count that isn't real — same
          no-fabricated-claims rule as the rest of this page (see file
          header and §6 above). Swap only the `quote`/`name` fields below
          once real testimonials are approved; the section/card structure
          does not need to change. */}
      <Section labelledBy="testimonios-titulo">
        <EditorialHeading as="h2" id="testimonios-titulo" className="text-3xl">
          Lo que dicen nuestras familias
        </EditorialHeading>
        <p className="mt-3 max-w-2xl text-sm leading-[var(--leading-relaxed)] text-text-muted">
          Contenido de muestra mientras preparamos testimonios reales.
        </p>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { quote: "CAMBIAR — Testimonio real de cliente 1", name: "CAMBIAR — Nombre cliente 1" },
            { quote: "CAMBIAR — Testimonio real de cliente 2", name: "CAMBIAR — Nombre cliente 2" },
            { quote: "CAMBIAR — Testimonio real de cliente 3", name: "CAMBIAR — Nombre cliente 3" },
          ].map((testimonial, i) => (
            <li key={testimonial.name}>
              <Reveal delayMs={i * 90}>
                <figure className="flex h-full flex-col rounded-lg border border-dashed border-hairline bg-marfil p-6">
                  <span className="mb-3 inline-flex w-fit items-center rounded-pill bg-crudo px-3 py-1 text-xs font-medium text-barro-hondo">
                    Ejemplo
                  </span>
                  <blockquote className="flex-1 font-display text-lg italic leading-[var(--leading-relaxed)] text-tinta">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-4 border-t border-hairline pt-3 text-sm font-medium text-text-muted">
                    {testimonial.name}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
        {/* Instagram — one homepage trust placement (Footer already carries
            the primary link; see components/layout/Footer.tsx). Plain
            outbound link only: no feed embed, no API, no iframe, no
            tracking pixel. */}
        <a
          href="https://www.instagram.com/hilitosoficial/"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-barro-hondo hover:text-tinta"
        >
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Síguenos en Instagram — @hilitosoficial
        </a>
      </Section>

      {/* 8 · FAQ (published brand answers only) */}
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

      {/* 9 · Final WhatsApp CTA */}
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
            <WhatsAppCTA href={buildGenericWhatsAppHref()} analyticsSource="home_final_cta" />
          </div>
        </Container>
      </Section>
    </main>
  );
}
