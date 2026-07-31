// components/layout/Header.tsx — AMARILLO. Shared public header: wordmark,
// desktop nav, WhatsApp CTA (reserved green), accessible mobile nav.
// Server Component; interactivity lives only in <MobileNav/> (client).
import Link from "next/link";
import { NAV_ITEMS } from "./nav-items";
import { MobileNav } from "./MobileNav";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { buildGenericWhatsAppHref } from "@/lib/whatsapp";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-marfil/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-page items-center justify-between gap-4 px-[var(--container-gutter)]">
        <Link
          href="/"
          className="font-display text-2xl font-semibold leading-none tracking-[var(--tracking-tight)] text-tinta"
          aria-label="Hilitos — inicio"
        >
          Hilitos
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-h-11 items-center text-sm text-tinta transition-colors duration-[var(--duration-fast)] hover:text-barro-hondo"
            >
              <span className="stitch-underline">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Visibility is controlled by this wrapper, NOT by passing display
              classes to WhatsAppCTA (whose base `inline-flex` would otherwise
              win over `hidden` at mobile widths and leak the CTA). */}
          <span className="hidden md:inline-flex">
            <WhatsAppCTA compact href={buildGenericWhatsAppHref()} />
          </span>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
