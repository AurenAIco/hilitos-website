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
   - `VERCEL_PROJECT_PRODUCTION_URL` when `VERCEL_ENV=production` (the
     project's own stable alias — **not** the real custom domain until
     cutover, see below);
   - otherwise `VERCEL_URL` (that specific preview/branch deployment's own
     unique host).
   Both are set automatically by Vercel's build system — nothing to
   configure.
3. `http://localhost:3000` — only reached when neither of the above
   applies, i.e. not running under Vercel at all. This app's only deploy
   target is Vercel (`next.config.ts`'s RE-2 comment), so "not on Vercel" is
   exactly "local `next dev` / local `next build`".

None of these are secrets: `NEXT_PUBLIC_SITE_URL` is already client-public
by its Next.js naming convention, and the `VERCEL_*` variables are
non-secret deployment metadata (flags/hostnames).

## Why `app/robots.ts` blocks every origin except `hilitos.co`

The live production site (GitHub Pages, `master` branch) is `hilitos.co`
today. This redesign must never be indexed until an authorized **Gate A6**
DNS cutover (Juanpa + Mónica — see `docs/OWNERSHIP.md` §6–7) points that
domain at this app. Until then:

- Every Vercel preview deployment — and this project's own Vercel
  **production** alias (e.g. `hilitos-website.vercel.app`), which is
  resolved as a valid Vercel origin above but is **not** the real custom
  domain — gets `Disallow: /`.
- Local development gets `Disallow: /`.
- Only a resolved origin whose hostname is exactly `hilitos.co` or
  `www.hilitos.co` (`lib/seo/siteUrl.ts`'s `isCanonicalProductionHostname`)
  gets `Allow: /` plus a `sitemap:` reference. In practice that only
  happens once `NEXT_PUBLIC_SITE_URL=https://hilitos.co` (or an equivalent
  custom-domain wiring) is configured **and** the domain has actually been
  cut over — the code capability exists now, but nothing in this slice
  flips it on.

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

Set in the Vercel project's environment variables (never committed), then
redeploy. This does not, by itself, perform the DNS cutover or attach the
domain to Vercel — those remain separate, explicitly authorized Gate A6
actions.

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
