// app/(public)/page.tsx — Homepage (2026-08 brand refresh, approved by
// Mónica/Juanpa). Server Component. Section order is the approved final
// structure (§8): hero → benefits → categories → short history → process →
// productos destacados → personalizados → regalos → opiniones → FAQ →
// contacto (footer + floating WhatsApp live in the shell).
//
// All editorial copy on this page (and in the components/home sections it
// composes) is the approved brand-refresh copy or owner-confirmed facts —
// nothing invented. Product data invariants are unchanged from the S1
// de-fixture pass: the live-catalog rail renders ONLY on a fresh ("ok")
// fetch — when the live catalog is unavailable, when it is "stale" last-good
// data, or when it simply has no featured designs yet, the rail renders
// nothing and this page stays purely editorial. It must never show a
// synthetic product, and never a real price/reference/availability the
// visitor could believe is current when it is not.
//
// Why "stale" is excluded rather than disclosed here: getStorefrontCatalog()'s
// fallback contract requires every caller that renders "stale" data to show a
// visible last-good indicator (see components/catalog/CatalogStatusBanner.tsx,
// used by /catalogo and /productos/[slug]). The homepage is editorial, not a
// catalog surface, so it opts out of rendering that data at all instead of
// carrying a banner — the honest option that needs no disclosure. Note that
// getStorefrontCatalog() returns a NON-null `catalog` for "stale" too, so the
// gate below must test `status`, not just `catalog`. The category cards
// (CategoryDiscover) follow the same fresh-only rule for live imagery.
import type { Metadata } from "next";
import Image from "next/image";
import { getFeaturedDesigns, getStorefrontCatalog } from "@/lib/catalog/storefront";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { FeaturedDesigns } from "@/components/product/FeaturedDesigns";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { buildGenericWhatsAppHref } from "@/lib/whatsapp";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";
import { BenefitsStrip } from "@/components/home/BenefitsStrip";
import { CategoryDiscover } from "@/components/home/CategoryDiscover";
import { HistoryTeaser } from "@/components/home/HistoryTeaser";
import { ProcessStrip } from "@/components/home/ProcessStrip";
import { PersonalizadosBand } from "@/components/home/PersonalizadosBand";
import { RegalosBand } from "@/components/home/RegalosBand";
import { Testimonials } from "@/components/home/Testimonials";
import { FaqSection } from "@/components/home/FaqSection";
import { ContactSection } from "@/components/home/ContactSection";

// Route-segment config: kept numerically identical to lib/catalog/storefront.ts's
// CATALOG_REVALIDATE_SECONDS (same convention as app/(public)/catalogo/page.tsx) —
// if you change one, change both.
export const revalidate = 300;

// Approved public website title (brand refresh §6) + the approved hero body
// facts as description — no new claim invented for SEO purposes.
// `title.absolute` (not a plain string) bypasses app/(public)/layout.tsx's
// "%s · Hilitos" template — a plain string here would render as
// "…Hilitos · Hilitos".
export const metadata: Metadata = {
  title: { absolute: "Hilitos — Ropita que cuida con amor" },
  description:
    "Ropita artesanal para recién nacidos y bebés de 0, 3 y 6 meses. Hecha en Santander con 100% algodón.",
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
  const freshCatalog = result.status === "ok" ? result.catalog : null;

  return (
    <main id="contenido" tabIndex={-1}>
      {/* 2 · Hero — editorial text left, large photography right (§9).
          No giant "Hilitos" heading: the header wordmark carries the brand. */}
      <Section labelledBy="hero-titulo" className="pt-10 md:pt-14">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="min-w-0 max-w-xl">
            <EditorialHeading as="h1" id="hero-titulo" className="text-display">
              Tejemos con amor
              <br />
              sus primeros momentos
            </EditorialHeading>
            <p className="mt-6 max-w-md text-lg leading-[var(--leading-relaxed)] text-text-muted">
              Ropita artesanal para recién nacidos
              <br />
              y bebés de 0, 3 y 6 meses.
              <br />
              Hecha en Santander con 100% algodón.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/catalogo" className="tracking-[0.08em]">
                VER COLECCIÓN
              </Button>
              <WhatsAppCTA
                href={buildGenericWhatsAppHref()}
                label="COMPRAR POR WHATSAPP"
                className="tracking-[0.08em]"
                analyticsSource="home_hero"
              />
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
            <Image
              src="/brand/hero-inicio.jpg"
              alt="Bebé recostada en su cuna con conjunto tejido rosado, diadema con lazo y conejito de peluche tejido"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </Section>

      {/* 3 · Four-benefit strip (§10) */}
      <BenefitsStrip />

      {/* 4 · Descubre Hilitos — REAL frozen categories via /colecciones (§11) */}
      <CategoryDiscover catalog={freshCatalog} />

      {/* 5 · Short history introduction → /nosotros (§12) */}
      <HistoryTeaser />

      {/* 6 · Del hilo a sus primeros días (§14) */}
      <ProcessStrip />

      {/* 7 · Productos destacados (fresh live V2 catalog only; renders nothing
          when the catalog is unavailable, stale, or has no featured designs) */}
      <FeaturedDesigns
        designs={featured}
        title="Productos destacados"
        ctaHref="/catalogo"
        ctaLabel="VER TODO EL CATÁLOGO"
      />

      {/* 8 · Personalizados (§16) */}
      <PersonalizadosBand />

      {/* 9 · Regalos para bebé — existing ajuares-y-estuches route (§17) */}
      <RegalosBand />

      {/* 10 · Opiniones de mamás — six approved testimonials (§18) */}
      <Testimonials />

      {/* 11 · FAQ — canonical legacy questions/answers, verbatim (§19) */}
      <FaqSection whatsappHref={buildGenericWhatsAppHref()} />

      {/* 12 · Contacto — owner-confirmed facts only (§20); nav anchor */}
      <ContactSection whatsappHref={buildGenericWhatsAppHref()} />
    </main>
  );
}
