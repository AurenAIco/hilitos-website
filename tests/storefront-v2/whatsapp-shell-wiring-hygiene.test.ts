// tests/storefront-v2/whatsapp-shell-wiring-hygiene.test.ts — Wave 1
// integration hardening.
//
// S6 made WhatsAppCTA fail closed, but shipped with six shell/editorial call
// sites (Header, Footer, MobileNav, both homepage CTA locations, Nosotros)
// still rendering `<WhatsAppCTA />` with no href — which always renders the
// disabled control, even when NEXT_PUBLIC_WHATSAPP_NUMBER IS configured. This
// file proves, by static source inspection, that every one of those six call
// sites now wires the canonical `buildGenericWhatsAppHref()` builder, and
// that no WhatsAppCTA render site anywhere under app/** or components/**
// omits an href prop — a regression guard against a seventh caller (present
// or future) silently reintroducing the same bug.
//
// HONESTY BOUNDARY: app/(public)/page.tsx and app/(public)/nosotros/page.tsx
// both render next/image, which this repo's `node --test` harness cannot
// render outside the Next runtime (see tests/homepage/home-featured-gate.test.ts's
// header for the precedent). Source inspection is therefore the proof for
// those two files; whatsapp-shell-wiring-rendered.test.ts covers Header,
// Footer and MobileNav (no next/image) with real rendered-output assertions.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();

function readSrc(...segments: string[]): string {
  return readFileSync(join(ROOT, ...segments), "utf8");
}

/** String-aware comment stripper — same implementation as
 * tests/seo/robots-sitemap.test.ts's stripComments (F17 regression: a naive
 * `.replace(/\/\/.*$/gm, "")` also truncates any "https://..." string
 * literal at the first `//`, which would corrupt this file's own scans if a
 * caller file ever grows a URL literal near a WhatsAppCTA tag). Tracks
 * string/template/comment state so URL literals in real code survive. */
function stripComments(src: string): string {
  let out = "";
  let i = 0;
  let quote: '"' | "'" | "`" | null = null;

  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];

    if (quote !== null) {
      out += ch;
      if (ch === "\\") {
        if (i + 1 < src.length) out += src[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      out += ch;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}

const RUNTIME_DIRS = ["app", "components"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, files);
    } else if (SOURCE_EXTENSIONS.has(extname(entry))) {
      files.push(full);
    }
  }
  return files;
}

// ---- the six previously-unwired shell/editorial call sites -----------------

const SHELL_CALLERS = [
  { label: "Header", path: ["components", "layout", "Header.tsx"] },
  { label: "Footer", path: ["components", "layout", "Footer.tsx"] },
  { label: "MobileNav", path: ["components", "layout", "MobileNav.tsx"] },
  { label: "Nosotros", path: ["app", "(public)", "nosotros", "page.tsx"] },
  { label: "Homepage", path: ["app", "(public)", "page.tsx"] },
];

for (const { label, path } of SHELL_CALLERS) {
  test(`${label} imports buildGenericWhatsAppHref from the canonical lib/whatsapp utility`, () => {
    const src = readSrc(...path);
    assert.match(
      src,
      /import\s*\{\s*buildGenericWhatsAppHref\s*\}\s*from\s*"@\/lib\/whatsapp"/,
      `${label} must import buildGenericWhatsAppHref from "@/lib/whatsapp"`,
    );
  });

  test(`${label} wires buildGenericWhatsAppHref() into every WhatsAppCTA it renders`, () => {
    const src = readSrc(...path);
    const tags = src.match(/<WhatsAppCTA\b[^>]*\/>/g) ?? [];
    assert.notEqual(tags.length, 0, `${label} must render at least one <WhatsAppCTA/>`);
    for (const tag of tags) {
      assert.match(
        tag,
        /href=\{buildGenericWhatsAppHref\(\)\}/,
        `${label}'s WhatsAppCTA call site must pass href={buildGenericWhatsAppHref()}, got: ${tag}`,
      );
    }
  });
}

test("the homepage wires every WhatsApp surface through the canonical builder (hero CTA + FAQ/contact section props)", () => {
  // 2026-08 brand refresh: the old second "final band" CTA was replaced by
  // the FAQ and Contacto sections (components/home), which render their own
  // <WhatsAppCTA/> from a `whatsappHref` prop. The invariant is unchanged —
  // every WhatsApp href on the homepage is built by buildGenericWhatsAppHref()
  // in page.tsx, never hardcoded — only the number of direct call sites moved.
  const src = readSrc(...["app", "(public)", "page.tsx"]);
  const tags = src.match(/<WhatsAppCTA\b[^>]*\/>/g) ?? [];
  assert.equal(tags.length, 1, `expected exactly 1 direct WhatsAppCTA call site on the homepage (hero), got ${tags.length}`);
  assert.match(src, /<FaqSection whatsappHref=\{buildGenericWhatsAppHref\(\)\}/);
  assert.match(src, /<ContactSection whatsappHref=\{buildGenericWhatsAppHref\(\)\}/);
});

// ---- no shell caller silently omits the canonical href, anywhere -----------

test("no <WhatsAppCTA/> render call site under app/** or components/** omits an href prop", () => {
  const files = RUNTIME_DIRS.flatMap((dir) => walk(join(ROOT, dir))).filter(
    // WhatsAppCTA.tsx is the component's own definition, not a caller.
    (file) => !file.endsWith(join("layout", "WhatsAppCTA.tsx")),
  );
  const offenders: string[] = [];
  for (const file of files) {
    // Strip comments first so a prose mention like Button.tsx's "// ... use
    // the dedicated <WhatsAppCTA/> ..." is never mistaken for an actual JSX
    // render call site.
    const src = stripComments(readFileSync(file, "utf8"));
    const tags = src.match(/<WhatsAppCTA\b[^>]*\/>/g) ?? [];
    for (const tag of tags) {
      if (!/\bhref=/.test(tag)) offenders.push(`${file}: ${tag}`);
    }
  }
  assert.deepEqual(offenders, [], `WhatsAppCTA call site(s) missing an href prop:\n${offenders.join("\n")}`);
});

// ---- stale placeholder comment removed --------------------------------------

test("lib/whatsapp.ts no longer describes the removed placeholder-href fallback", () => {
  const src = readSrc("lib", "whatsapp.ts");
  assert.equal(
    /fall\s*back\s+to\s+WhatsAppCTA'?s?\s+existing\s+honest\s+placeholder/i.test(src),
    false,
    "the stale comment describing the removed placeholder-href behavior must be gone",
  );
});
