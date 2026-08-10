// tests/amarillo/s5-mobile-drawer.test.ts — Slice S5 assertion suite.
//
// Confirmed defect: Header renders `backdrop-blur-sm`, which (like
// `filter`/`transform`) establishes a CSS containing block for
// `position: fixed` descendants. The mobile drawer's `fixed inset-0` overlay
// lived inside that header subtree, so it resolved against Header's ~64px
// box instead of the viewport — the scrim didn't cover the screen and
// background links stayed clickable underneath it.
//
// Fix: portal the open overlay to document.body via react-dom's
// createPortal, escaping the containing block while the trigger button stays
// in place inside Header.
//
// Static source-tree checks only — no jsdom/React Testing Library (this repo
// runs exactly one test runner, node:test; see tests/adm1a §INV-23). These
// checks mirror the static-scan style of tests/adm1a/s1-admin-boundary and
// tests/storefront-v2/seam-isolation. Behavioral/geometry proof (overlay
// covers window.innerHeight, focus actually traps, no click-through at
// 320/375/390px) requires a real browser and is out of node:test's reach —
// verified separately.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const MOBILE_NAV_PATH = join(ROOT, "components", "layout", "MobileNav.tsx");
const HEADER_PATH = join(ROOT, "components", "layout", "Header.tsx");

const mobileNavSrc = readFileSync(MOBILE_NAV_PATH, "utf8");
const headerSrc = readFileSync(HEADER_PATH, "utf8");

test("Header still applies backdrop-blur-sm — the premium blurred header is preserved when the menu is closed", () => {
  assert.match(headerSrc, /backdrop-blur-sm/);
});

test("MobileNav imports createPortal from react-dom", () => {
  assert.match(mobileNavSrc, /import\s*\{\s*createPortal\s*\}\s*from\s*"react-dom"/);
});

test("the open overlay is portaled to document.body, escaping Header's backdrop-filter containing block", () => {
  const portalCallIndex = mobileNavSrc.indexOf("createPortal(");
  assert.notEqual(portalCallIndex, -1, "expected a createPortal(...) call in MobileNav");

  // Guard the call is reached only when open — never during SSR/initial
  // hydration render, since `open` starts false in both environments.
  const beforeCall = mobileNavSrc.slice(0, portalCallIndex);
  const lastOpenCheck = beforeCall.slice(-40);
  assert.match(
    lastOpenCheck,
    /open\s*\n?\s*\?\s*$/,
    `expected createPortal to be reached only via an "open ? ..." conditional; found: ${JSON.stringify(lastOpenCheck)}`,
  );

  const afterCall = mobileNavSrc.slice(portalCallIndex);
  const bodyArgIndex = afterCall.indexOf("document.body,");
  assert.notEqual(bodyArgIndex, -1, "expected createPortal's second argument to be document.body");

  const portaledJsx = afterCall.slice(0, bodyArgIndex);
  assert.match(portaledJsx, /fixed inset-0/, "the fixed viewport overlay wrapper must be inside the portaled JSX");
  assert.match(portaledJsx, /role="dialog"/, "the dialog panel must be inside the portaled JSX, not left behind in Header's subtree");
});

test('MobileNav "open" state starts false (SSR and initial client render never enter the portal branch → no hydration mismatch)', () => {
  assert.match(mobileNavSrc, /const \[open, setOpen\] = useState\(false\)/);
});

test("dialog a11y contract preserved: role=dialog, aria-modal, aria-label, aria-controls/id pairing", () => {
  assert.match(mobileNavSrc, /role="dialog"/);
  assert.match(mobileNavSrc, /aria-modal="true"/);
  assert.match(mobileNavSrc, /aria-label="Menú"/);
  assert.match(mobileNavSrc, /aria-controls="menu-movil"/);
  assert.match(mobileNavSrc, /id="menu-movil"/);
});

test("focus trap: keydown handler cycles Tab within the panel's focusable set", () => {
  assert.match(mobileNavSrc, /event\.key !== "Tab"/);
  assert.match(mobileNavSrc, /FOCUSABLE/);
  assert.match(mobileNavSrc, /panel!?\.contains\(active\)/);
});

test("Escape closes the drawer", () => {
  assert.match(mobileNavSrc, /event\.key === "Escape"/);
});

test("focus is restored to the trigger button on close", () => {
  assert.match(mobileNavSrc, /triggerRef\.current\?\.focus\(\)/);
});

test("body scroll is locked while open and restored on close", () => {
  assert.match(mobileNavSrc, /document\.body\.style\.overflow = "hidden"/);
  assert.match(mobileNavSrc, /document\.body\.style\.overflow = previousOverflow/);
});

test("clicking the scrim (outside the panel) closes the drawer", () => {
  assert.match(mobileNavSrc, /aria-hidden="true"[\s\S]{0,80}tabIndex=\{-1\}[\s\S]{0,80}onClick=\{close\}/);
});

test("crossing the desktop breakpoint while open auto-closes the drawer", () => {
  // 2026-08 brand refresh: the desktop nav moved from md (768px) to lg
  // (1024px) because the five-item nav no longer fits a 768px header row;
  // the drawer's auto-close breakpoint moved with it (same behavior, new
  // threshold — must always match the Header/MobileNav lg: classes).
  assert.match(mobileNavSrc, /matchMedia\("\(min-width: 1024px\)"\)/);
  assert.match(mobileNavSrc, /if \(event\.matches\) close\(\)/);
});

test("the drawer panel can scroll independently on short screens", () => {
  const portalCallIndex = mobileNavSrc.indexOf("createPortal(");
  const panelMatch = mobileNavSrc.slice(portalCallIndex).match(/id="menu-movil"[\s\S]{0,400}?className="([^"]*)"/);
  assert.ok(panelMatch, "expected to find the panel's className near id=\"menu-movil\"");
  assert.match(panelMatch![1], /overflow-y-auto/);
});
