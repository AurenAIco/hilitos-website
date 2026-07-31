// lib/whatsapp.ts
// VERDE (Gate G5 — storefront catalog connect) — wa.me link builder, per
// docs/OWNERSHIP.md §2 ("lib/whatsapp.ts .... VERDE (wa.me builder, created
// later)") and the TODO in components/layout/WhatsAppCTA.tsx ("wire the real
// wa.me URL + prefilled message via lib/whatsapp.ts (Verde-owned)").
//
// This module NEVER embeds, guesses, or fabricates a phone number
// (mission pack §6B, restated in WhatsAppCTA.tsx). It reads the number ONLY
// from NEXT_PUBLIC_WHATSAPP_NUMBER — a PUBLIC env var by necessity, because
// a WhatsApp "click-to-chat" business number is meant to be visible in the
// rendered href (it is not a secret, unlike a Supabase key). When the env
// var is unset, every builder below returns null and WhatsAppCTA renders a
// disabled, non-interactive control instead (slice S6) — never a fake,
// believable-but-broken placeholder href.
import type { StorefrontDesign, StorefrontVariant } from "@/lib/contract";

const RAW_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "";
// wa.me requires digits only (no "+", spaces, or punctuation).
const DIGITS_ONLY = RAW_NUMBER.replace(/\D/g, "");

function waMeHref(message: string): string | null {
  if (!DIGITS_ONLY) return null;
  return `https://wa.me/${DIGITS_ONLY}?text=${encodeURIComponent(message)}`;
}

/** Gate for showing ANY WhatsApp CTA against a design/variant — sold-out
 * items must never render a dead-end contact button (mission requirement). */
export function isPurchasable(availability: "available" | "sold_out"): boolean {
  return availability === "available";
}

/** Prefilled message + href for one published design (catalog card / detail
 * page default state, no variant chosen yet). Returns null when no business
 * number is configured — never a fabricated link. */
export function buildDesignWhatsAppHref(design: Pick<StorefrontDesign, "designRef" | "name">): string | null {
  return waMeHref(`Hola, me interesa la Ref. ${design.designRef} — ${design.name}. ¿Está disponible?`);
}

/** Prefilled message + href for one selected color/talla variant. */
export function buildVariantWhatsAppHref(
  design: Pick<StorefrontDesign, "designRef" | "name">,
  variant: Pick<StorefrontVariant, "ref" | "color" | "size">,
): string | null {
  return waMeHref(
    `Hola, me interesa la Ref. ${variant.ref} — ${design.name} (color ${variant.color.name}, talla ${variant.size}). ¿Está disponible?`,
  );
}

/** Generic contact link for non-product contexts (e.g. the catalog
 * "unavailable" fallback state) — never implies a specific item's stock. */
export function buildGenericWhatsAppHref(): string | null {
  return waMeHref("Hola, quisiera más información sobre el catálogo de Hilitos.");
}
