# Hilitos.co — Gate A6 Domain Cutover Runbook

**Status: not authorized. No step below has been executed.** This document exists so the actual
cutover day is a short, controlled checklist — not a development project. Authorization is
**Juanpa + Mónica** (per `docs/OWNERSHIP.md` §6–7), for the whole cutover, not per-step.

Prerequisites before this runbook may start:

1. **Remaining product photos delivered** and uploaded through the existing pipeline (out of this
   mission's scope — tracked separately).
2. **This mission's diff reviewed and merged** into `redesign/main` (see the mission's own final
   report for exactly what changed).

Nothing below performs a DNS change, a Vercel domain attachment, or opens search indexing by
itself — every step is written out so whoever executes Gate A6 can do it in order, confirm each
result, and stop immediately if something doesn't match.

---

## 1 · Pre-flight — production visual smoke (on the current `*.vercel.app` URL)

Do this **before** touching the domain, against the still-current preview/production alias
(`hilitos-website.vercel.app`):

- [ ] Homepage loads; hero, "Piezas destacadas", craft/history, process, FAQ, final CTA all render.
- [ ] `/catalogo` shows every published design, grouped by category, with the featured rail.
- [ ] Open 3–4 representative `/productos/[slug]` pages across different categories: images load,
      color/talla selection works, price updates per variant, availability badge is correct.
- [ ] `/colecciones/[slug]` for at least 2 categories with designs, and confirm a category with
      zero designs shows the honest "Aún no hay piezas publicadas…" empty state, not an error.
- [ ] "También te puede interesar" (related designs) appears on a product with siblings in its
      category, and is absent (no empty section) on a product whose category has none.
- [ ] `/nosotros` and `/privacy` render.
- [ ] Invalid routes: a bogus top-level path, a nonexistent `/productos/[slug]`, and a nonexistent
      `/colecciones/[slug]` each return the branded 404 — never a 200, never a stack trace.
- [ ] No `CatalogStatusBanner` "stale"/"unavailable" state is showing (would indicate the backend
      is unreachable — do not proceed with cutover while the live catalog is down).

## 2 · WhatsApp sanity

- [ ] Every WhatsApp CTA (header, footer, mobile drawer, homepage hero + final band, nosotros,
      product detail) opens `https://wa.me/<canonical number>` with a prefilled, correctly encoded
      Spanish message.
- [ ] A product-detail CTA's message contains the *selected variant's* ref, not the design's base
      ref, once a color/talla has been chosen.
- [ ] No CTA anywhere renders the disabled/greyed control (that would mean
      `NEXT_PUBLIC_WHATSAPP_NUMBER` is unset in the production environment — fix before cutover).

## 3 · Desktop / mobile smoke

- [ ] Desktop: nav, header WhatsApp CTA, footer, catalog grid, product detail all check out.
- [ ] Mobile width: hamburger opens/closes, traps focus, closes on Escape/scrim click/navigation;
      WhatsApp CTA stays reachable without excessive scrolling on a product page.
- [ ] Keyboard-only pass: tab through header → mobile menu trigger → nav → skip link jumps to
      `#contenido`; every interactive control shows a visible focus ring.

## 4 · Analytics sanity (only if Slice E's endpoint has since been turned on)

This mission ships analytics **wiring**, not an active vendor — see the mission's final report,
Analytics section, for the decision this step depends on.

- [ ] If `NEXT_PUBLIC_ANALYTICS_ENDPOINT` is set: confirm the three approved events actually
      arrive at the endpoint, with exactly these properties (see `lib/analytics.ts`'s event
      contract — there is no `collection_view` event, and the WhatsApp event is `whatsapp_click`,
      not `whatsapp_cta_click`):
  - [ ] `catalog_view` — `pathname`, plus `collection_ref` (the collection slug on
        `/colecciones/[slug]`, `null` on `/catalogo`; both routes emit this same event).
  - [ ] `product_view` — `product_ref` (the base storefront design ref, e.g. `4194`),
        `category`, `pathname`.
  - [ ] `whatsapp_click` — `product_ref` (the same base design ref, or `null` off a product
        page), `variant_ref` (the exact selected SKU, present only when one is selected),
        `source` (the CTA's placement label, e.g. `header` / `product_detail` — the property is
        `source`, not `context`), `pathname`.
- [ ] If it is still unset: confirm this is intentional (no analytics active), not an oversight.
- [ ] If analytics were turned on for the first time, `/privacy` was updated first to disclose it
      (non-PII, no cookies) — do not activate before that copy is live.

## 5 · Vercel custom domain attachment

- [ ] In the Vercel project, attach `hilitos.co` and `www.hilitos.co` as custom domains, pointed at
      **this project** (`redesign/main`'s production deployment — confirm the project's Production
      Branch is `redesign/main`, never `master`).
- [ ] Confirm the apex (`hilitos.co`) → `www.hilitos.co` redirect (or vice versa — whichever is the
      agreed canonical) is configured the way Vercel's domain UI offers, so there is exactly one
      canonical host.
- [ ] Confirm HTTPS certificate issuance completes for both hosts before proceeding.

**Do not skip ahead** — steps 6–8 below all depend on this attachment having completed, per
`lib/seo/siteUrl.ts`'s documented resolution order (`VERCEL_PROJECT_PRODUCTION_URL` changes at
domain attachment, before anyone touches an env var).

## 6 · `NEXT_PUBLIC_SITE_URL`

- [ ] Set `NEXT_PUBLIC_SITE_URL=https://hilitos.co` in the Vercel project's environment variables,
      **scoped to Production only** (not Preview, not Development — see `docs/SEO.md`'s scoping
      note; Vercel's "add variable" UI pre-checks all three by default, which must be corrected).
- [ ] Trigger a new Production deployment/redeploy — `app/robots.ts` and `app/sitemap.ts` are
      evaluated at build time and will not pick up the env change otherwise (`docs/SEO.md`, "Why a
      rebuild is required").

## 7 · Robots / indexing — the actual open-crawling moment

- [ ] After the redeploy, fetch `https://hilitos.co/robots.txt` directly and confirm it now reads
      `Allow: /`, `Disallow: /admin`, and `Sitemap: https://hilitos.co/sitemap.xml` — **this is the
      moment indexing opens**, not the domain attachment and not the env var individually (both
      must be true together — see `docs/SEO.md`'s full environment matrix for why either one alone
      still fails closed).
- [ ] Fetch `https://hilitos.co/sitemap.xml` and confirm it lists the four static routes plus a
      `/productos/[slug]` entry for every currently-published design and a `/colecciones/[slug]`
      entry for every category that has at least one — no more, no fewer (cross-check the count
      against `/catalogo`'s own product count).
- [ ] Confirm `hilitos-website.vercel.app` (the bare Vercel alias) still returns `Disallow: /` —
      only the real custom domain may ever be crawlable.

## 8 · Legacy URL redirects (only where valuable)

- [ ] Compare the legacy `hilitos.co` site's URL structure (static HTML paths) against the new
      route set. If any legacy URL has real inbound links or search equity worth preserving,
      configure a redirect (Vercel `redirects()` in `next.config.ts`, a shared/Violeta-approved
      change) from the old path to its closest new equivalent. If the legacy site has no
      indexed/linked paths worth preserving, this step is a no-op — do not invent redirects for
      URLs nobody links to.

## 9 · Post-cutover confirmation

- [ ] Re-run the full smoke from steps 1–3 against the real `https://hilitos.co` (not the
      `*.vercel.app` alias) — the origin, canonical URLs, and OG/Twitter metadata all resolve
      differently now, and this is the first real chance to see that end to end.
- [ ] Confirm the legacy GitHub Pages deployment (the `master` branch) is no longer what visitors
      to `hilitos.co` actually see.
- [ ] Submit the new sitemap in Google Search Console / Bing Webmaster Tools (manual step — the
      `sitemap:` line in `robots.txt` alone does not force a re-crawl).

## 10 · Rollback

If anything in steps 5–7 goes wrong (certificate failure, wrong content serving, catalog backend
unreachable at the worst possible moment):

- [ ] Detach the custom domain from this Vercel project (or point DNS back at GitHub Pages,
      whichever is faster to reverse in the moment) — this immediately restores the legacy site as
      the live `hilitos.co`, since `master`/GitHub Pages was never touched by any of the above.
- [ ] Unset `NEXT_PUBLIC_SITE_URL` (or leave it — it is inert again once the domain is detached,
      since `app/robots.ts`'s guard requires the resolved *hostname* to be canonical, and a
      detached domain no longer resolves there).
- [ ] No data was written, migrated, or deleted by any step above — a rollback is purely a
      domain/DNS reversal, not a data recovery operation.

---

## What this runbook deliberately does not cover

- Uploading the remaining product photos (separate lane).
- Any Supabase/backend/Railway change (this app has no direct Supabase access — see
  `lib/catalog/storefront.ts` — and this mission made zero backend changes).
- Owner-confirmation business copy (shipping, payment methods, hours, address, returns policy,
  testimonials) — see the mission's final report, Trust Content section. None of that is a cutover
  blocker; it can ship before or after Gate A6 once confirmed, as its own small change.
