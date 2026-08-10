// components/home/CategoryDiscover.tsx — "Descubre Hilitos" category cards
// (2026-08 brand refresh §11). HARD INVARIANT: presents ONLY the REAL frozen
// six-category structure (lib/contract.ts CategorySlug — Violeta-frozen) via
// the existing /colecciones/[slug] routes and the existing Spanish editorial
// fallbacks (lib/catalog/collectionRoute.ts). No new umbrella categories, no
// remapping, no backend involvement.
//
// Photography-first: when a FRESH ("ok") live catalog is available, each
// card shows a real design image from that category (same server-side
// buildStorefrontImageUrl seam DesignCard uses) and empty categories are
// hidden — mirroring how /catalogo and the sitemap treat empty categories.
// Without a fresh catalog the six cards render with the branded textile
// placeholder instead — never a synthetic product image, never fixture data.
// Server Component (buildStorefrontImageUrl is server-only — V-1 rule).
import Link from "next/link";
import Image from "next/image";
import type { StorefrontCatalogV2 } from "@/lib/contract";
import {
  FROZEN_COLLECTION_SLUGS,
  getCollectionDesigns,
  getCollectionMeta,
} from "@/lib/catalog/collectionRoute";
import { buildStorefrontImageUrl } from "@/lib/catalog/storefront";
import { Section } from "@/components/ui/Section";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";

export function CategoryDiscover({ catalog }: { catalog: StorefrontCatalogV2 | null }) {
  const cards = FROZEN_COLLECTION_SLUGS.map((slug) => {
    const meta = getCollectionMeta(slug, catalog);
    const designs = catalog ? getCollectionDesigns(catalog, slug) : [];
    const cover = designs[0]?.primaryImage ?? null;
    return { slug, meta, cover, hasCatalog: catalog !== null, designCount: designs.length };
  }).filter((card) => !card.hasCatalog || card.designCount > 0);

  if (cards.length === 0) return null;

  return (
    <Section labelledBy="descubre-titulo">
      <EditorialHeading as="h2" id="descubre-titulo" className="text-3xl">
        Descubre Hilitos
      </EditorialHeading>
      <p className="mt-3 max-w-xl leading-[var(--leading-relaxed)] text-text-muted">
        Explora las categorías del catálogo y encuentra la prenda ideal.
      </p>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">
        {cards.map((card, i) => (
          <li key={card.slug}>
            <Reveal delayMs={i * 70}>
              <Link
                href={`/colecciones/${card.slug}`}
                className="group block"
                aria-label={`Ver ${card.meta.title}`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
                  {card.cover ? (
                    <Image
                      src={buildStorefrontImageUrl(card.cover.url)}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover object-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)] group-hover:scale-[var(--hover-scale)]"
                    />
                  ) : (
                    <ImagePlaceholder name={card.meta.title} fill />
                  )}
                </div>
                <span className="mt-3 flex items-center gap-2 text-base font-medium text-tinta transition-colors duration-[var(--duration-fast)] group-hover:text-barro-hondo">
                  {card.meta.title}
                  <span aria-hidden="true" className="text-barro-hondo">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
