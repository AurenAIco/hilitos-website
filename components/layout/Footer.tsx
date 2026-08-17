// components/layout/Footer.tsx — AMARILLO. Shared public footer. Copy uses
// only facts already published by the brand on the live site (hilitos.co):
// "Ajuar artesanal para bebés · Bucaramanga, Colombia".
//
// Instagram link (Slice D, final pre-launch value pass): @hilitosoficial is
// the handle directly observed live on hilitos.co today — classified
// SAFE_EXISTING_CANONICAL (see the mission's final report), unlike the
// address/hours/shipping/payment/returns/testimonial/heritage claims on
// that same page, which are NOT migrated here pending owner confirmation.
// A stale social handle is a low-severity, easily-corrected risk (a dead
// link), not a business-fact error like a wrong address or return policy.
//
// URL is the canonical profile origin+path (trailing slash — Instagram's
// own real canonical form), no query string: this repo's own canonical-URL
// convention (lib/seo/siteUrl.ts's resolveSiteUrl — origin/path only, no
// query/fragment) is deliberately mirrored here rather than embedding a
// transient personalization param (e.g. "?hl=en", a language override) as
// if it were part of the account's identity. Plain link, no embed, no
// Instagram API/SDK, no tracking pixel.
import Link from "next/link";
import { NAV_ITEMS } from "./nav-items";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { ThreadMotif } from "@/components/editorial/ThreadMotif";
import { MascotSlot } from "@/components/editorial/MascotSlot";
import { buildGenericWhatsAppHref } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-crudo/40">
      <div className="mx-auto w-full max-w-page px-[var(--container-gutter)] py-12">
        <ThreadMotif className="mb-10 opacity-70" />
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            {/* Secondary "Hilitos by MM" mascot — subtle footer brand detail
                only; renders nothing until the approved asset lands (see
                MascotSlot). The Cormorant wordmark stays the primary mark. */}
            <MascotSlot className="mb-3" />
            <p className="font-display text-2xl font-semibold text-tinta">Hilitos</p>
            <p className="mt-2 text-sm leading-[var(--leading-relaxed)] text-text-muted">
              Ropita que cuida con amor · Bucaramanga, Colombia
            </p>
            <a
              href="https://www.instagram.com/hilitosoficial/"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex min-h-11 w-fit items-center text-sm text-tinta hover:text-barro-hondo"
            >
              @hilitosoficial en Instagram
            </a>
          </div>

          <nav aria-label="Pie de página" className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex min-h-11 w-fit items-center text-sm text-tinta hover:text-barro-hondo"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/privacy"
              className="inline-flex min-h-11 w-fit items-center text-sm text-tinta hover:text-barro-hondo"
            >
              Privacidad
            </Link>
          </nav>

          <div className="md:max-w-xs">
            <p className="mb-3 text-sm text-text-muted">¿Tienes preguntas? Escríbenos.</p>
            <WhatsAppCTA href={buildGenericWhatsAppHref()} analyticsSource="footer" />
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-hairline pt-6 text-xs text-text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Hilitos</p>
          <p>Powered by AURENA AI</p>
        </div>
      </div>
    </footer>
  );
}
