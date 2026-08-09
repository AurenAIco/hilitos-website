// lib/analytics.ts — vendor-neutral, cookie-free event dispatcher for the
// three approved conversion signals: catalog/collection view, product
// detail view, and WhatsApp click (with which surface fired it, and the
// product/variant ref where applicable). Mirrors this codebase's
// established fail-closed pattern (lib/whatsapp.ts's WhatsApp number,
// lib/catalog/storefront.ts's STOREFRONT_BACKEND_URL, lib/seo/siteUrl.ts's
// NEXT_PUBLIC_SITE_URL): with no NEXT_PUBLIC_ANALYTICS_ENDPOINT configured,
// track() is a complete no-op — no request, no console noise, no vendor
// script loaded. No analytics vendor is chosen or installed here; wiring an
// endpoint (a first-party collection route, or a provider's ingest URL) is
// a separate, explicit product decision.
//
// PII rule: a payload here is never more than an event name, the pathname,
// a design/variant ref, a collection slug, or a CTA source label. Never a
// customer name, phone number, or WhatsApp message body — those only ever
// exist inside the wa.me deep link itself, which this module never reads.
//
// EVENT CONTRACT (approved, final pre-launch QA delta — corrects two prior
// inconsistencies):
//   - Problem A: a collection slug is a `collection_ref`, never a bare
//     `category` — "category" already means something different elsewhere
//     in the catalog contract (lib/contract.ts's CategorySlug). There is no
//     separate collection_view event: /catalogo and /colecciones/[slug] are
//     both a `catalog_view`, distinguished only by collection_ref being
//     null vs. a real slug.
//   - Problem B: `product_ref` ALWAYS means the base storefront design ref
//     (e.g. "4194") on every event that carries it — product_view AND
//     whatsapp_click — so a view→click join never has to reconcile two
//     different identifiers for the same design. A specific selected
//     variant (e.g. "4194-BEIGE-CELESTE-T6") is carried separately as
//     `variant_ref`, never in place of product_ref.
"use client";

const ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT?.trim() || "";

export type AnalyticsEvent =
  | { name: "catalog_view"; collection_ref: string | null }
  | { name: "product_view"; product_ref: string; category: string }
  | { name: "whatsapp_click"; product_ref: string | null; variant_ref?: string; source: string };

/** Fire-and-forget. Never throws — a broken analytics endpoint must never
 * break navigation or page rendering. */
export function track(event: AnalyticsEvent): void {
  if (!ENDPOINT) return;

  try {
    const payload = JSON.stringify({
      ...event,
      pathname: window.location.pathname,
    });

    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
      return;
    }

    // sendBeacon is unavailable (rare); keepalive lets the request survive a
    // click-triggered navigation (e.g. the WhatsApp CTA) the same way.
    void fetch(ENDPOINT, {
      method: "POST",
      body: payload,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch {
    // Never let analytics break the page.
  }
}
