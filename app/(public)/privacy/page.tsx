// app/privacy/page.tsx — S4 (Legal/About closure).
// Content migrated verbatim-in-substance from the brand's currently public
// privacy page (mirrored at legacy/privacy/index.html; confirmed
// live-identical during S4 source review). No fact on this page — the
// contact channel, the data collected, the stated purposes, the no-sale/
// no-share commitment, or the update year — is new; each is carried from
// that source. No formal legal-entity identity, tax ID, physical address,
// retention period, third-party processor, regulatory complaint channel, or
// privacy-law/certification claim is asserted, because none is
// source-supported (S4 mission §"Privacy page").
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Política de privacidad de Hilitos: qué información recopilamos y cómo la usamos.",
};

export default function PrivacyPage() {
  return (
    <main id="contenido">
      <Section labelledBy="privacidad-titulo" className="pt-10 md:pt-14">
        <div className="max-w-2xl">
          <EditorialHeading as="h1" id="privacidad-titulo" className="text-3xl">
            Política de privacidad
          </EditorialHeading>
          <p className="mt-2 text-sm text-text-muted">Última actualización: 2025</p>

          <div className="mt-8 flex flex-col gap-8">
            <section aria-labelledby="privacidad-alcance">
              <EditorialHeading as="h2" id="privacidad-alcance" className="text-xl">
                A quién aplica
              </EditorialHeading>
              <p className="mt-3 leading-[var(--leading-relaxed)] text-text-muted">
                Hilitos respeta la privacidad de sus clientes. Esta política aplica a las
                personas que interactúan con Hilitos como clientes, ya sea a través de este
                sitio web o de WhatsApp.
              </p>
            </section>

            <section aria-labelledby="privacidad-informacion">
              <EditorialHeading as="h2" id="privacidad-informacion" className="text-xl">
                Qué información recopilamos
              </EditorialHeading>
              <p className="mt-3 leading-[var(--leading-relaxed)] text-text-muted">
                La información que los clientes comparten con nosotros, como nombre o número
                de teléfono, se utiliza únicamente para brindar atención y servicio.
              </p>
            </section>

            <section aria-labelledby="privacidad-uso">
              <EditorialHeading as="h2" id="privacidad-uso" className="text-xl">
                Cómo usamos tu información
              </EditorialHeading>
              <p className="mt-3 leading-[var(--leading-relaxed)] text-text-muted">
                Utilizamos WhatsApp y nuestro sitio web únicamente para comunicarnos con los
                clientes, responder consultas y gestionar pedidos de nuestros productos.
              </p>
            </section>

            <section aria-labelledby="privacidad-terceros">
              <EditorialHeading as="h2" id="privacidad-terceros" className="text-xl">
                Uso compartido de tu información
              </EditorialHeading>
              <p className="mt-3 leading-[var(--leading-relaxed)] text-text-muted">
                Hilitos no vende ni comparte información personal con terceros.
              </p>
            </section>

            <section aria-labelledby="privacidad-contacto">
              <EditorialHeading as="h2" id="privacidad-contacto" className="text-xl">
                Cómo contactarnos
              </EditorialHeading>
              <p className="mt-3 leading-[var(--leading-relaxed)] text-text-muted">
                Si tienes alguna pregunta sobre esta política de privacidad o sobre cómo
                usamos tu información, puedes escribirnos a{" "}
                <a href="mailto:contacto@hilitos.co" className="underline hover:text-barro-hondo">
                  contacto@hilitos.co
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </Section>
    </main>
  );
}
