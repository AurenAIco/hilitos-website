# `STOREFRONT_IMAGE_HOST`

Gate G5 (Verde, storefront catalog connect). This file is the tracked
reference for this one env var — `.env.example` documents it too, but
`.env*` is gitignored (`.gitignore:34`), so `.env.example` never ships to
any reviewer, CI run, or person configuring Vercel. This file does ship.

## What it is

The public hostname of the storefront's public product-image object
storage. The live `GET /storefront/catalog` backend contract emits image
`url` fields as a bare **path** (e.g.
`/storage/v1/object/public/product-images/products/{id}/{ref}.jpg` — the
backend strips scheme + host by design), never a full URL.
`STOREFRONT_IMAGE_HOST` is prepended to that path, server-side, to build an
absolute URL `next/image` can fetch (`lib/catalog/storefront.ts`'s
`buildStorefrontImageUrl`).

It is **not** a Supabase client, key, or authenticated API URL of any kind —
this app never talks to Supabase directly — and it is **not** a secret: it
appears verbatim inside every rendered image URL. It stays server-only by
convention (no `NEXT_PUBLIC_` prefix), not because its value is sensitive.

## Required shape: a bare hostname

Valid: `cdn.example.com`

Invalid, and each will fail the build with a clear error
(`lib/catalog/storefrontImageHost.ts`'s `resolveStorefrontImageHost`):

| Invalid example | Why |
|---|---|
| `https://cdn.example.com` | scheme not allowed |
| `cdn.example.com:8443` | port not allowed — the existing contract (`protocol: "https"`, no port, in `next.config.ts`) never uses one |
| `cdn.example.com/images` | pathname not allowed |
| `cdn.example.com?x=1` | query string not allowed |
| `cdn.example.com#x` | fragment not allowed |
| `cdn example.com` | whitespace not allowed anywhere |

Case is not part of validation: a value that is otherwise a valid bare
hostname is accepted regardless of case, then **normalized to lowercase**
before use — e.g. `CDN.EXAMPLE.COM` → `cdn.example.com`. This normalization
is what keeps `next/image`'s `remotePatterns` hostname match (case-sensitive)
and the lowercase `URL.hostname` on every runtime image URL in agreement.

## Absence vs. malformed — different outcomes, on purpose

- **Absent or empty** (after trimming) → falls back to the inert placeholder
  `image-bucket-placeholder.invalid` (an RFC 2606 reserved, non-resolvable
  TLD). This is the expected state today — no real value is configured yet
  — and it is exactly what the Amarillo fixture-only build renders against,
  unaffected either way.
- **Present but malformed** → the build fails loudly with a message naming
  the invalid value and the required shape. It does **not** silently fall
  back to the placeholder — a silent fallback here would let `next/image`
  return `400 url parameter is not allowed` for every product image at
  runtime instead, with no build-time signal that anything was wrong.
- **Present, valid, but uppercase/mixed case** → accepted and normalized to
  lowercase.

## Evaluated at build time — changing it requires a rebuild

`next.config.ts` reads this env var once, at **config-eval time**, and
freezes the resolved value into `next/image`'s `remotePatterns` allowlist for
that build's output. `lib/catalog/storefront.ts`'s `buildStorefrontImageUrl`
reads the same env var again at **request time**, through the same
resolution function
(`lib/catalog/storefrontImageHost.ts`'s `resolveStorefrontImageHost` — the
single shared source of truth for both call sites, so they cannot disagree
about what host is allowlisted vs. what host ends up in image URLs).

Practical consequence: **changing `STOREFRONT_IMAGE_HOST` requires a new
build and redeploy — updating the env var and simply restarting the running
instance is not sufficient.** If the value the running instance sees at
request time ever differs from the value the build saw (including across
Vercel environments scoped differently for build vs. runtime), the allowlist
and the URL builder will disagree and every image will 400.

## Where to set it

Vercel project environment variables (not committed anywhere in this repo).
For local development, copy `.env.example` to `.env.local` and set it there
if you need to test against a real host; leave it unset to use the inert
placeholder.
