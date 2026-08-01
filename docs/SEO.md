# SEO foundation (S7A)

Environment reference for `lib/seo/siteUrl.ts`, `app/robots.ts`, `app/sitemap.ts`,
and `app/layout.tsx`'s `metadataBase`/OG/Twitter defaults. Like
`docs/STOREFRONT_IMAGE_HOST.md`, this file (not `.env.example`, which
`.gitignore:34`'s `.env*` pattern excludes from every commit) is the
authoritative, committed reference for these variables.

## `NEXT_PUBLIC_SITE_URL`

The authoritative override for the public site origin. When unset, the app
falls back to a Vercel-supplied deployment origin (on Vercel) or
`http://localhost:3000` (everywhere else) — see "Resolution order" below.

**Required shape:** an absolute origin only — scheme + host, nothing else.

Valid: `https://hilitos.co`

Invalid, and each fails the build loudly (`lib/seo/siteUrl.ts`'s
`resolveSiteUrl`), naming the bad value and the required shape:

| Invalid example | Why |
|---|---|
| `hilitos.co` | no scheme — not a parseable absolute URL |
| `ftp://hilitos.co` | scheme must be http or https |
| `http://hilitos.co` | http not allowed for a real public origin — https required |
| `https://hilitos.co/tienda` | path not allowed — origin only |
| `https://hilitos.co?utm=1` | query string not allowed |
| `https://hilitos.co#top` | fragment not allowed |

A trailing slash (`https://hilitos.co/`) is accepted and normalized away —
the resolved origin never has one. `http://` is accepted only for
`localhost` / `127.0.0.1`, for local testing convenience.

**Absent or empty** (after trimming) is not an error — it falls through to
the next resolution step below, same "absent vs. malformed are different
outcomes" contract as `STOREFRONT_IMAGE_HOST`.

## Resolution order

1. `NEXT_PUBLIC_SITE_URL`, if set and valid.
2. A Vercel-supplied deployment origin, if running on Vercel (`VERCEL` is
   set) and no override is configured:
   - `VERCEL_PROJECT_PRODUCTION_URL` when `VERCEL_ENV=production`;
   - otherwise `VERCEL_URL` (that specific preview/branch deployment's own
     unique host).
   Both are set automatically by Vercel's build system — nothing to
   configure.

   ⚠️ **`VERCEL_PROJECT_PRODUCTION_URL` — accurate semantics.** Vercel
   defines it as *"the shortest production **custom** domain or vercel.app
   domain"*, and it **is always set, including on preview deployments**.
   Two consequences, both corrected here after an independent review found
   the earlier description wrong:
   - It is **not** guaranteed to be a `*.vercel.app` alias. Once
     `hilitos.co` is **attached to the Vercel project**, this variable
     resolves to `hilitos.co` itself — with nobody setting any environment
     variable. **Production-origin resolution therefore changes at domain
     attachment, not at the `NEXT_PUBLIC_SITE_URL` step.** Do not treat
     "no env var configured" as proof that the resolved origin is still
     non-canonical.
   - Because it is present in previews too, the `VERCEL_ENV === "production"`
     condition in `resolveVercelOrigin` is load-bearing: without it every
     preview would resolve to the production origin.

   Neither point controls crawling — see the next section.
3. `http://localhost:3000` — only reached when neither of the above
   applies, i.e. not running under Vercel at all. This app's only deploy
   target is Vercel (`next.config.ts`'s RE-2 comment), so "not on Vercel" is
   exactly "local `next dev` / local `next build`".

None of these are secrets: `NEXT_PUBLIC_SITE_URL` is already client-public
by its Next.js naming convention, and the `VERCEL_*` variables are
non-secret deployment metadata (flags/hostnames).

## Why preview deployments are blocked from crawling

The live production site (GitHub Pages, `master` branch) is `hilitos.co`
today. This redesign must never be indexed until an authorized **Gate A6**
DNS cutover (Juanpa + Mónica — see `docs/OWNERSHIP.md` §6–7) points that
domain at this app.

`app/robots.ts` decides crawlability with **two guards, in this order**:

**Guard 1 — `VERCEL_ENV` (checked first, takes precedence over
`NEXT_PUBLIC_SITE_URL`).** Any Vercel deployment whose `VERCEL_ENV` is
something other than `production` — `preview`, `development`, or any custom
environment — gets a blanket `Disallow: /` **regardless of which origin
resolved**.

This guard exists because the hostname check alone was **not** sufficient.
An independent review reproduced a preview deployment emitting `Allow: /`
and `Sitemap: https://hilitos.co/sitemap.xml` simply because
`NEXT_PUBLIC_SITE_URL=https://hilitos.co` had been saved in Vercel's
**Preview** scope as well as Production — which is Vercel's *default*, since
its "add variable" UI pre-checks Production, Preview **and** Development.

**Guard 2 — canonical hostname.** Only a resolved origin whose hostname is
exactly `hilitos.co` or `www.hilitos.co`
(`lib/seo/siteUrl.ts`'s `isCanonicalProductionHostname`) gets `Allow: /`
plus a `sitemap:` reference. Local development and any non-canonical Vercel
production alias (e.g. `hilitos-website.vercel.app`) both fail here.

Resulting matrix:

| Environment | robots.txt |
|---|---|
| `VERCEL_ENV=preview` (any origin, canonical or not) | `Disallow: /` |
| `VERCEL_ENV=development` | `Disallow: /` |
| any custom `VERCEL_ENV` (e.g. `staging`) | `Disallow: /` |
| `VERCEL_ENV=production` + non-canonical alias | `Disallow: /` |
| `VERCEL_ENV=production` + `hilitos.co` / `www.hilitos.co` | `Allow: /`, `Disallow: /admin`, `Sitemap:` |
| local development (no Vercel vars) | `Disallow: /` |

**Crawling does not open exclusively through the `NEXT_PUBLIC_SITE_URL`
step.** Because `VERCEL_PROJECT_PRODUCTION_URL` becomes the production
**custom** domain once `hilitos.co` is attached to the Vercel project (see
the resolution section above), a *production* deployment can satisfy guard 2
with no environment variable set by anyone. **Attaching the domain is itself
a Gate A6 action** — treat it, not the env var, as the moment crawlability
becomes live, and confirm both are authorized together.

### Scoping `NEXT_PUBLIC_SITE_URL` when you do configure it

Scope it to the **Production environment only**. After this correction,
selecting Preview scope no longer opens crawling (guard 1 blocks it), but it
is still unnecessary and should be avoided: it makes previews resolve
metadata and sitemap URLs against the production origin, which is misleading
when debugging a preview.

## Why a rebuild is required

`app/robots.ts` and `app/sitemap.ts` only read `process.env` — no dynamic
request APIs (headers, cookies, search params) — so Next.js statically
generates both at **build time** and serves the cached output afterward,
same as any other static route. Changing `NEXT_PUBLIC_SITE_URL` (or any
`VERCEL_*` variable) after a deployment has already been built does **not**
change what that running deployment serves — a new build is required, same
practical consequence as `docs/STOREFRONT_IMAGE_HOST.md`'s
`STOREFRONT_IMAGE_HOST` contract.

## Expected cutover value

```
NEXT_PUBLIC_SITE_URL=https://hilitos.co
```

Set in the Vercel project's environment variables (never committed), scoped
to **Production only** (see the scoping note above), then redeploy. This
does not, by itself, perform the DNS cutover or attach the domain to
Vercel — those remain separate, explicitly authorized Gate A6 actions.

Reminder from above: attaching `hilitos.co` to the Vercel project can make
production builds resolve the canonical origin **on its own**, so sequence
the attachment and the crawl-open decision deliberately rather than assuming
the env var is the only trigger.

## S7B / follow-up residuals (not fixed in S7A — recorded, not crossed)

- **Open Graph image + full brand OG/Twitter copy on real storefront
  pages:** `app/(public)/layout.tsx` already owns `title` /
  `openGraph.siteName` for every public route, and per Next.js's metadata
  merge rules a segment's own `openGraph` object fully replaces (not
  deep-merges) its parent's — so anything set in `app/layout.tsx`'s
  `openGraph` (root) is inert for storefront pages regardless of what S7A
  adds there. `app/(public)/layout.tsx` is listed as **Explicitly shared
  (requires Violeta approval to edit)** in `docs/OWNERSHIP.md` §2, which is
  outside S7A's authorized file boundary. Extending it with `openGraph.images`
  / a matching `twitter` block is real S7B (or Violeta-approved) work.
- **Apple touch icon:** no existing repo-owned asset is square /
  appropriately sized (`public/brand/*.jpg` are all portrait product/craft
  photography, 1024×1248–1536). Cropping one into a fake icon would be
  inventing branding (explicitly out of scope), so this slice ships without
  one; `app/favicon.ico` (existing, unchanged) still covers the baseline
  favicon via Next.js's file-convention.
- **Social-preview image:** same reasoning as the Apple icon — no
  repository asset in a sane OG aspect ratio (~1.91:1) exists yet, so
  `twitter.card` is `summary` (text-only) rather than
  `summary_large_image`. Needs a real, purpose-made asset from
  Amarillo/Mónica, not a generated or cropped substitute.
- **Dynamic sitemap entries:** `app/sitemap.ts` lists only the four
  finished static public routes. `/productos/[slug]` and
  `/colecciones/[slug]` need an enumerable list of published slugs from
  Verde's catalog data layer (`lib/catalog/**`) before they can be added
  without inventing URLs — see the `S7B EXTENSION POINT` comment in that
  file.

## S7B disposition (Wave 1 integration, `integration/storefront-wave1-legal-seo`)

Route-level title/description/canonical closed for the five routes the
integration mandate named, plus one additional residual that turned out to
fit cleanly. See `tests/integration/s7b-route-metadata.test.ts` for the
behavioral proof of every item below.

**Closed:**

- `/`, `/catalogo`, `/nosotros`, `/privacy` — each now has a meaningful
  Spanish `description` (reusing copy already approved and live elsewhere
  in the same page/Footer — no new claim invented) and an
  `alternates.canonical` built from `lib/seo/siteUrl.ts`'s `resolveSiteUrl()`,
  the same S7A resolver `app/sitemap.ts` and `app/layout.tsx`'s
  `metadataBase` already use. `/`'s title uses `title: { absolute: … }` to
  bypass `app/(public)/layout.tsx`'s `"%s · Hilitos"` template — a plain
  string there would have rendered as `"… Hilitos · Hilitos"`.
- `/colecciones/[slug]` — S2's dynamic `getCollectionMeta()`-sourced
  title/description is unchanged; `generateMetadata` now also returns
  `alternates.canonical` for each of the six frozen slugs. An invalid slug
  still returns only `{ title: "Colección" }` (no canonical) — the page
  component calls `notFound()` for that same slug, so a canonical pointing
  at a route that 404s would be self-contradictory.
- `/productos/[slug]` (residual, closed rather than deferred): its existing
  `generateMetadata` already calls `getStorefrontCatalog()` once and has
  `design` in scope, so adding `alternates.canonical` for a resolved design
  fit without a second backend fetch or broader refactor, per the
  integration mandate's own fit test. An unresolved slug (fetch
  unavailable, or the slug doesn't exist) still returns only
  `{ title: "Producto" }` — no canonical — matching the collections
  fail-closed contract.

**Still residual (unchanged from the list above — not touched by this
integration):** OG image / full brand OG-Twitter copy, Apple touch icon,
social-preview image, and dynamic sitemap entries for `/productos/[slug]`
and `/colecciones/[slug]` (no enumerable published-slug source exists yet;
`app/sitemap.ts` still lists exactly the same four static routes).
