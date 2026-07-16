// components/product/ProductCard.tsx — AMARILLO visual implementation.
// The prop interface is FROZEN and SHARED — imported from @/lib/components
// (never redefined locally). Pure and props-driven: no fetch, no endpoint
// knowledge, no WhatsApp link. Links to the PLANNED /productos/[slug] route.
//
// A11Y NOTE (visual-vs-accessibility, reported in the handoff): the pack
// suggests the Ref hangtag "using --hilo"; --hilo on --marfil fails AA for
// text, so the hangtag CHROME (border/thread) uses --hilo and the Ref TEXT
// uses --barro-hondo (the AA-critical tone). Accessibility wins (§11).
import Image from "next/image";
import Link from "next/link";
import type { ProductCardProps } from "@/lib/components";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PriceTag } from "@/components/ui/PriceTag";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { SizeChip } from "@/components/ui/SizeChip";

export function ProductCard({ product, href, priority = false }: ProductCardProps) {
  const target = href ?? `/productos/${product.slug}`;
  const image = product.images[0];

  return (
    <article className="group relative rounded-lg has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-focus-ring">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            placeholder={image.placeholder ? "blur" : undefined}
            blurDataURL={image.placeholder ?? undefined}
            className="object-cover object-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <ImagePlaceholder name={product.name} fill />
        )}

        {/* Ref. — garment-hangtag detail (subtle; --hilo chrome, AA text) */}
        <span
          aria-hidden="true"
          className="absolute right-2.5 top-0 flex flex-col items-center"
        >
          <span className="h-2.5 w-px bg-hilo" />
          <span className="rounded-sm border border-hilo bg-marfil/95 px-1.5 py-0.5 text-[0.65rem] leading-none text-barro-hondo shadow-sm">
            Ref. {product.ref}
          </span>
        </span>

        {product.sale ? (
          <span className="absolute left-2.5 top-2.5 rounded-pill bg-barro-hondo px-2 py-0.5 text-xs text-marfil">
            Oferta
          </span>
        ) : null}

        {product.featured ? (
          <span aria-hidden="true" className="absolute bottom-0 left-0 h-0.5 w-full bg-hilo/60" />
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <h3 className="text-sm leading-[var(--leading-snug)] text-tinta">
          <Link href={target} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>
        {/* Screen-reader access to the ref (visual hangtag is decorative) */}
        <span className="sr-only">Referencia {product.ref}</span>
        <PriceTag price={product.price} priceLabel={product.priceLabel} />
        <div>
          <AvailabilityBadge availability={product.availability} />
        </div>
        {product.colors.length > 0 ? (
          <ul aria-label="Colores" className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {product.colors.map((color) => (
              <li key={color.name} className="flex">
                <ColorSwatch color={color} />
              </li>
            ))}
          </ul>
        ) : null}
        {product.sizes.length > 0 ? (
          <ul aria-label="Tallas" className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {product.sizes.map((size) => (
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
