// components/home/ContactSection.tsx — homepage contact block, the nav's
// "Contacto" destination (#contacto). 2026-08 brand refresh §20.
//
// FACTS RULE: every business fact below is OWNER-CONFIRMED — address, hours,
// phone, payment methods, and carrier were supplied by Mónica (via Juanpa,
// 2026-08-09, first landed on redesign/feat/social-proof-instagram). The
// Instagram handle/URL is the approved canonical @hilitosoficial. Nothing
// here is invented; the WhatsApp CTA stays env-driven and fail-closed
// (lib/whatsapp.ts) — no number is ever hardcoded into a wa.me link.
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

export function ContactSection({ whatsappHref }: { whatsappHref: string | null }) {
  return (
    // scroll-mt clears the 4rem sticky header when the nav's /#contacto
    // anchor jumps here (same reasoning as #contenido's scroll-margin-top in
    // styles/amarillo.css).
    <Section bleed id="contacto" labelledBy="contacto-titulo" className="scroll-mt-18 bg-sage/40">
      <Container>
        <EditorialHeading as="h2" id="contacto-titulo" className="text-3xl">
          Contacto
        </EditorialHeading>
        <p className="mt-3 max-w-xl leading-[var(--leading-relaxed)] text-text-muted">
          Escríbenos por WhatsApp y te acompañamos a elegir la prenda ideal.
        </p>
        <div className="mt-5">
          <WhatsAppCTA href={whatsappHref} analyticsSource="home_contacto" />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-hairline bg-marfil p-6">
            <h3 className="text-lg font-medium text-tinta">Visítanos</h3>
            <p className="mt-2 text-sm leading-[var(--leading-relaxed)] text-text-muted">
              Calle 113 #22-24, Piso 2
              <br />
              Bucaramanga, Colombia
            </p>
            <p className="mt-3 text-sm leading-[var(--leading-relaxed)] text-text-muted">
              Lun – Vie: 9:30 a.&nbsp;m. – 12:00 m. y 3:00 p.&nbsp;m. – 5:00 p.&nbsp;m.
              <br />
              Sáb: 9:30 a.&nbsp;m. – 12:00 m.
            </p>
            <a
              href="tel:+573016168730"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-barro-hondo hover:text-tinta"
            >
              301 616 8730
            </a>
          </div>

          <div className="rounded-lg border border-hairline bg-marfil p-6">
            <h3 className="text-lg font-medium text-tinta">Síguenos</h3>
            <p className="mt-2 text-sm leading-[var(--leading-relaxed)] text-text-muted">
              Novedades, prendas nuevas y detalles del taller.
            </p>
            <a
              href="https://www.instagram.com/hilitosoficial"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-barro-hondo hover:text-tinta"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-5 shrink-0"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
              </svg>
              @hilitosoficial
            </a>
          </div>

          <div className="rounded-lg border border-hairline bg-marfil p-6">
            <h3 className="text-lg font-medium text-tinta">Pagos y envíos</h3>
            <ul className="mt-2 space-y-1 text-sm leading-[var(--leading-relaxed)] text-text-muted">
              <li>Transferencia Bancolombia</li>
              <li>Bre-B</li>
              <li>Nequi</li>
              <li>Link de pago con tarjeta de crédito</li>
              <li>Contra entrega</li>
            </ul>
            <p className="mt-3 text-sm leading-[var(--leading-relaxed)] text-text-muted">
              Envíos por Inter Rapidísimo.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
