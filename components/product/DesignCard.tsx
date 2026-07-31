// components/product/DesignCard.tsx
// VERDE (Gate G5 — storefront catalog connect). Grouped-by-design card for
// the live StorefrontCatalogV2 contract (PR #7) — a NEW, parallel component
// to Amarillo's components/product/ProductCard.tsx (V1 flat ProductContract,
// left completely untouched). Reuses shared presentational primitives
// (ColorSwatch, SizeChip, ImagePlaceholder is NOT needed here: every
// StorefrontDesign.primaryImage is contract-guaranteed non-null).
import Image from "next/image";
import Link from "next/link";
import type { StorefrontDesign } from "@/lib/contract";
import { buildStorefrontImageUrl } from "@/lib/catalog/storefront";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { SizeChip } from "@/components/ui/SizeChip";

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// V2's two-state StorefrontAvailability mirrors the exact Spanish wording of
// the frozen V1 AVAILABILITY_LABELS_ES map (lib/contract.ts) for "available"
// and "unavailable" — kept local because V1's map is keyed on the 3-state
// Availability union (it also has "made_to_order"), which V2 never emits.
const AVAILABILITY_LABEL: Record<StorefrontDesign["availability"], string> = {
  available: "Disponible",
  sold_out: "Agotado",
};

const AVAILABILITY_STYLE: Record<StorefrontDesign["availability"], { badge: string; dot: string }> = {
  available: { badge: "bg-sage/35 text-tinta", dot: "bg-sage" },
  sold_out: { badge: "border border-hairline bg-transparent text-text-muted", dot: "bg-hairline" },
};

export function DesignCard({ design, priority = false }: { design: StorefrontDesign; priority?: boolean }) {
  const style = AVAILABILITY_STYLE[design.availability];

  return (
    <article className="group relative rounded-lg has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-focus-ring">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
        <Image
          src={buildStorefrontImageUrl(design.primaryImage.url)}
          alt={design.primaryImage.alt ?? design.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          priority={priority}
          placeholder={design.primaryImage.placeholder ? "blur" : undefined}
          blurDataURL={design.primaryImage.placeholder ?? undefined}
          className="object-cover object-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        <span aria-hidden="true" className="absolute right-2.5 top-0 flex flex-col items-center">
          <span className="h-2.5 w-px bg-hilo" />
          <span className="rounded-sm border border-hilo bg-marfil/95 px-1.5 py-0.5 text-[0.65rem] leading-none text-barro-hondo shadow-sm">
            Ref. {design.designRef}
          </span>
        </span>

        {design.featuredRank !== null ? (
          <span aria-hidden="true" className="absolute bottom-0 left-0 h-0.5 w-full bg-hilo/60" />
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <h3 className="text-sm leading-[var(--leading-snug)] text-tinta">
          <Link href={`/productos/${design.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {design.name}
          </Link>
        </h3>
        <span className="sr-only">Referencia {design.designRef}</span>
        <p className="text-sm font-medium text-tinta">
          {design.variants.length > 1 ? "Desde " : ""}
          {COP.format(design.priceFrom)}
        </p>
        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs ${style.badge}`}
          >
            <span aria-hidden="true" className={`size-1.5 rounded-pill ${style.dot}`} />
            {AVAILABILITY_LABEL[design.availability]}
          </span>
        </div>
        {design.colors.length > 0 ? (
          <ul aria-label="Colores" className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {design.colors.map((color) => (
              <li key={color.name} className="flex">
                <ColorSwatch color={color} />
              </li>
            ))}
          </ul>
        ) : null}
        {design.sizes.length > 0 ? (
          <ul aria-label="Tallas" className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {design.sizes.map((size) => (
              <li key={size} className="flex">
                <SizeChip size={size} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
