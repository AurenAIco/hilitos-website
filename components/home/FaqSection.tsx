// components/home/FaqSection.tsx — Preguntas frecuentes (2026-08 brand
// refresh §19). CONTENT RULE: these are the CANONICAL Hilitos FAQs, ported
// VERBATIM from the approved legacy site (legacy/index.html §#preguntas,
// identical at hilitos-website origin/master 8ab791d — the live hilitos.co
// page). Same questions, same answers, same order, same emphasis (<strong>)
// — do not rewrite, summarize, or extend without owner approval.
//
// Presentation is native <details>/<summary> — keyboard accessible out of
// the box, no dependency, subtle separators (same pattern the storefront
// already used).
//
// KNOWN CONTENT NOTES for owner review (ported as-is per the "same answers"
// rule): the shipping answer names Servientrega/Envia/TCC while the newest
// owner-confirmed facts (Mónica, 2026-08-09) say Inter Rapidísimo; the
// exchanges answer embeds the WhatsApp number +57 305 356 0882 as text.
import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

const FAQ_ITEMS: ReadonlyArray<{ q: string; a: ReactNode }> = [
  {
    q: "¿De qué material son las prendas?",
    a: (
      <p>
        Fibra natural suave, transpirable y resistente, ideal para la piel
        sensible del bebé. Seleccionamos cuidadosamente cada hilo para
        garantizar la máxima suavidad.
      </p>
    ),
  },
  {
    q: "¿Es hipoalergénica?",
    a: (
      <p>
        Sí, no irrita ni pica y es ideal para pieles sensibles. Nuestras
        fibras están pensadas especialmente para la delicada piel de los
        recién nacidos.
      </p>
    ),
  },
  {
    q: "¿Qué talla debo comprar?",
    a: (
      <p>
        La talla RN (recién nacido) es ideal para recibir al bebé y suele
        durar unas 3 semanas. Si el bebé ya nació y tiene buen peso, podemos
        asesorarte sobre la talla más adecuada.
      </p>
    ),
  },
  {
    q: "¿Se puede lavar en lavadora?",
    a: (
      <p>
        Sí, en ciclo delicado con agua fría. No dejar en remojo para
        conservar la forma y suavidad de las fibras.
      </p>
    ),
  },
  {
    q: "¿Encoge al lavarla?",
    a: (
      <p>
        No, siempre y cuando se seque al aire libre y no se use secadora. El
        calor excesivo puede afectar las fibras naturales.
      </p>
    ),
  },
  {
    q: "¿Sirve como regalo para baby shower?",
    a: (
      <p>
        Sí, es uno de los regalos más especiales y prácticos para recibir a
        un bebé. Podemos prepararlo con empaque especial para regalo sin
        costo adicional.
      </p>
    ),
  },
  {
    q: "¿Hacen envíos a otras ciudades?",
    a: (
      <p>
        Sí, realizamos envíos nacionales a todo Colombia. Trabajamos con
        transportadoras confiables como Servientrega, Envia y TCC para que tu
        pedido llegue en perfectas condiciones.
      </p>
    ),
  },
  {
    q: "¿Cuánto tarda el envío?",
    a: (
      <p>
        Entre 2 y 3 días hábiles a nivel nacional. Para Bucaramanga y
        ciudades cercanas, puede ser el mismo día o al día siguiente.
      </p>
    ),
  },
  {
    q: "¿Qué incluye el set?",
    a: (
      <>
        <p>Dependiendo de la referencia puede incluir:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Saco o bata tejida</li>
          <li>Pantalón con pie cubierto</li>
          <li>Gorro</li>
          <li>Manoplas</li>
          <li>Body interior</li>
        </ul>
        <p className="mt-2">Escríbenos para conocer el detalle de cada referencia.</p>
      </>
    ),
  },
  {
    q: "¿La ropa es fresca?",
    a: (
      <p>
        Sí, está diseñada para mantener al bebé cómodo sin exceso de calor.
        La fibra natural es transpirable y regula la temperatura del cuerpo
        naturalmente.
      </p>
    ),
  },
  {
    q: "¿Cuál es la política de cambios y devoluciones?",
    a: (
      <>
        <p>
          Aceptamos cambios dentro de los <strong>5 días calendario</strong>{" "}
          después de recibir tu pedido, siempre que la prenda esté sin uso,
          con etiquetas y en su empaque original.
        </p>
        <p className="mt-2">
          Para solicitar un cambio, escríbenos por WhatsApp al{" "}
          <strong>+57 305 356 0882</strong> y te guiaremos en el proceso. Los
          gastos de envío del cambio corren por cuenta del cliente.
        </p>
        <p className="mt-2">
          Si el producto llegó con algún defecto de fábrica, el cambio es
          completamente sin costo.
        </p>
      </>
    ),
  },
  {
    q: "¿Cómo manejan mis datos personales?",
    a: (
      <>
        <p>
          Los datos que compartes con nosotros (nombre, dirección, teléfono)
          se usan <strong>únicamente</strong> para procesar tu pedido y
          hacerte seguimiento de envío.
        </p>
        <p className="mt-2">
          Nunca compartimos tu información con terceros ni la usamos con
          fines publicitarios sin tu consentimiento. Tus datos están
          protegidos y son tratados de acuerdo con la Ley 1581 de 2012 de
          protección de datos personales de Colombia.
        </p>
      </>
    ),
  },
];

export function FaqSection({ whatsappHref }: { whatsappHref: string | null }) {
  return (
    <Section labelledBy="faq-titulo">
      <EditorialHeading as="h2" id="faq-titulo" className="text-3xl">
        Preguntas frecuentes
      </EditorialHeading>
      <p className="mt-3 max-w-xl leading-[var(--leading-relaxed)] text-text-muted">
        Resolvemos tus dudas para que puedas elegir con tranquilidad.
      </p>
      <div className="mt-8 max-w-2xl">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group border-b border-hairline">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-tinta [&::-webkit-details-marker]:hidden">
              <span className="font-medium">{item.q}</span>
              <span
                aria-hidden="true"
                className="text-xl leading-none text-barro-hondo transition-transform duration-[var(--duration-fast)] group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mb-4 mt-1 text-sm leading-[var(--leading-relaxed)] text-text-muted">
              {item.a}
            </div>
          </details>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-start gap-3">
        <p className="text-sm text-text-muted">¿Tienes alguna otra pregunta?</p>
        <WhatsAppCTA
          href={whatsappHref}
          label="Pregúntanos por WhatsApp"
          analyticsSource="home_faq"
        />
      </div>
    </Section>
  );
}
