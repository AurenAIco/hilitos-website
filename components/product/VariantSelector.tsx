// components/product/VariantSelector.tsx
// VERDE (Gate G5 — storefront catalog connect). Client Component: color/
// talla variant selection for /productos/[slug], matching the sparse
// StorefrontVariant[] shape from PR #7 (NOT a full color × size matrix —
// some combinations legitimately don't exist and must be handled, not
// guessed). Owns the WhatsApp CTA gating rule: the CTA is shown ONLY when a
// concrete, in-stock variant is resolved — never for sold_out, and never for
// an unresolved/nonexistent color+size combination (no dead-end button).
//
// WAVE 3 correction (Wave-1 review V-1, BLOCKING): this Client Component
// must NEVER import lib/catalog/storefront.ts or read
// process.env.STOREFRONT_IMAGE_HOST — that env var is server-only (no
// NEXT_PUBLIC_ prefix), so it is always undefined in the browser, and a
// prior version of this file called buildStorefrontImageUrl() directly
// here, silently recomputing the inert placeholder host on every client
// render regardless of what the server actually resolved. Image URLs are
// now resolved once, server-side, in the nearest Server Component
// (app/(public)/productos/[slug]/page.tsx) and passed in already-absolute
// via primaryImageUrl/variantImageUrls below — this component only ever
// looks up a URL, never builds one.
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { StorefrontDesign, StorefrontVariant } from "@/lib/contract";
import { buildVariantWhatsAppHref, isPurchasable } from "@/lib/whatsapp";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

/** variant.ref -> absolute, next/image-ready URL. Resolved server-side (see
 * app/(public)/productos/[slug]/page.tsx, which calls
 * lib/catalog/storefront.ts's buildStorefrontImageUrl for every variant)
 * because STOREFRONT_IMAGE_HOST is a server-only env var — see the V-1 note
 * above. Every key here is one of design.variants[number].ref. */
export type ResolvedVariantImageUrls = Record<string, string>;

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const AVAILABILITY_LABEL: Record<StorefrontVariant["availability"], string> = {
  available: "Disponible",
  sold_out: "Agotado",
};

function findVariant(design: StorefrontDesign, color: string, size: string): StorefrontVariant | undefined {
  return design.variants.find((v) => v.color.name === color && v.size === size);
}

function sizesForColor(design: StorefrontDesign, color: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of design.variants) {
    if (v.color.name === color && !seen.has(v.size)) {
      seen.add(v.size);
      out.push(v.size);
    }
  }
  return out;
}

export function VariantSelector({
  design,
  primaryImageUrl,
  variantImageUrls,
}: {
  design: StorefrontDesign;
  /** Absolute, next/image-ready URL for design.primaryImage, resolved
   * server-side. Used whenever no variant is selected/resolved. */
  primaryImageUrl: string;
  variantImageUrls: ResolvedVariantImageUrls;
}) {
  const first = design.variants[0];
  const [selectedColor, setSelectedColor] = useState(first.color.name);
  const [selectedSize, setSelectedSize] = useState(first.size);

  const availableSizesForColor = useMemo(() => sizesForColor(design, selectedColor), [design, selectedColor]);
  const selectedVariant = useMemo(
    () => findVariant(design, selectedColor, selectedSize),
    [design, selectedColor, selectedSize],
  );

  function handleColorChange(colorName: string) {
    setSelectedColor(colorName);
    const sizes = sizesForColor(design, colorName);
    if (!sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
    }
  }

  const activeImage = selectedVariant?.image ?? design.primaryImage;
  // Look up the already-resolved URL — never compute one here (V-1). Falls
  // back to primaryImageUrl if a selected variant's ref is somehow absent
  // from the map (defensive; page.tsx builds the map from these same
  // design.variants, so this should be unreachable in practice).
  const activeImageUrl = (selectedVariant ? variantImageUrls[selectedVariant.ref] : undefined) ?? primaryImageUrl;
  const activePrice = selectedVariant?.price ?? design.priceFrom;
  const canShowCta = selectedVariant !== undefined && isPurchasable(selectedVariant.availability);
  const waHref = selectedVariant ? buildVariantWhatsAppHref(design, selectedVariant) : null;

  return (
    <div className="grid gap-10 md:grid-cols-2 md:items-start">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
        <Image
          src={activeImageUrl}
          alt={activeImage.alt ?? design.name}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          placeholder={activeImage.placeholder ? "blur" : undefined}
          blurDataURL={activeImage.placeholder ?? undefined}
          className="object-cover object-center"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-barro-hondo">Ref. {design.designRef}</p>
        <h1 className="mt-1 font-display text-3xl font-medium leading-[var(--leading-tight)] text-tinta">
          {design.name}
        </h1>
        <p className="mt-3 text-lg font-medium text-tinta">{COP.format(activePrice)}</p>

        {design.description ? (
          <p className="mt-4 max-w-md leading-[var(--leading-relaxed)] text-text-muted">{design.description}</p>
        ) : null}

        {design.colors.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="text-xs font-medium uppercase tracking-wide text-text-muted">Color</legend>
            <ul className="mt-2 flex flex-wrap items-center gap-2">
              {design.colors.map((color) => (
                <li key={color.name}>
                  <button
                    type="button"
                    onClick={() => handleColorChange(color.name)}
                    aria-pressed={selectedColor === color.name}
                    className={`flex min-h-11 items-center gap-2 rounded-pill border px-3 py-1.5 text-sm transition-colors duration-[var(--duration-fast)] ${
                      selectedColor === color.name
                        ? "border-barro-hondo bg-crudo/60 text-tinta"
                        : "border-hairline text-text-muted hover:border-barro-hondo"
                    }`}
                  >
                    <ColorSwatch color={color} />
                    {/* ColorSwatch renders the name as VISIBLE text itself when
                        color.hex is absent (see components/ui/ColorSwatch.tsx's
                        name-only-chip branch) — this trailing text is added only
                        for the hex branch, where ColorSwatch is icon-only (dot +
                        aria-label). Rendering it unconditionally previously
                        produced a visible duplicate ("Beige Beige") for every
                        no-hex colorway; each color must be named exactly once. */}
                    {color.hex ? color.name : null}
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>
        ) : null}

        {design.sizes.length > 0 ? (
          <fieldset className="mt-5">
            <legend className="text-xs font-medium uppercase tracking-wide text-text-muted">Talla</legend>
            <ul className="mt-2 flex flex-wrap items-center gap-2">
              {design.sizes.map((size) => {
                const enabled = availableSizesForColor.includes(size);
                return (
                  <li key={size}>
                    <button
                      type="button"
                      disabled={!enabled}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`min-h-11 min-w-11 rounded-sm border px-3 py-1.5 text-sm transition-colors duration-[var(--duration-fast)] ${
                        !enabled
                          ? "cursor-not-allowed border-hairline text-hairline"
                          : selectedSize === size
                            ? "border-barro-hondo bg-crudo/60 text-tinta"
                            : "border-hairline text-text-muted hover:border-barro-hondo"
                      }`}
                    >
                      {size}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ) : null}

        <div className="mt-6">
          {selectedVariant ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs ${
                selectedVariant.availability === "available"
                  ? "bg-sage/35 text-tinta"
                  : "border border-hairline bg-transparent text-text-muted"
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-pill ${selectedVariant.availability === "available" ? "bg-sage" : "bg-hairline"}`}
              />
              {AVAILABILITY_LABEL[selectedVariant.availability]}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-pill border border-hairline px-2.5 py-1 text-xs text-text-muted">
              Combinación no disponible
            </span>
          )}
        </div>

        {canShowCta ? (
          <div className="mt-6">
            <WhatsAppCTA
              href={waHref ?? undefined}
              label="Confirmar por WhatsApp"
              analyticsSource="product_detail"
              analyticsProductRef={design.designRef}
              analyticsVariantRef={selectedVariant?.ref}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
