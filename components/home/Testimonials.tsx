// components/home/Testimonials.tsx — "Opiniones de mamás" (2026-08 brand
// refresh §18). EXACTLY these six testimonials: approved editorial
// adaptations of REAL customer messages, supplied verbatim by Mónica/Juanpa.
// Premium editorial cards on warm surfaces — no raw WhatsApp screenshots, no
// star-rating gimmicks, no profile photos, no cities, no invented purchases,
// no counts. Do not add, remove, or reword entries without owner approval.
import { Section } from "@/components/ui/Section";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { Reveal } from "@/components/ui/Reveal";

const TESTIMONIALS = [
  {
    name: "KELLY",
    quote:
      "Quedé encantada con Hilitos. Las prendas son hermosas y de muy buena calidad. Me gustó tanto mi pedido que ya quiero hacer el siguiente.",
  },
  {
    name: "KAREN",
    quote: "Todo llegó hermoso, como siempre. Cada día me enamoro más de Hilitos.",
  },
  {
    name: "YULLY",
    quote:
      "Mi pedido llegó hermoso y la tela es súper suave. Una vez más quedé 100% complacida, tanto por la calidad como por el excelente servicio.",
  },
  {
    name: "LAURA",
    quote:
      "Cada día me enamoro más de esta marca. Son excelentes en todo: calidad, diseños y atención.",
  },
  {
    name: "NELVY",
    quote:
      "Mi pedido llegó divino; incluso era más bello en persona de lo que se veía en las fotos. ¡Mil gracias por todo!",
  },
  {
    name: "PAOLA",
    quote:
      "Recibimos el pedido y quedamos muy felices. El empaque, el tejido y el diseño son hermosos; todo está hecho con muchísimo amor. Fue una emoción tan grande que hasta mi mamá lloró de felicidad.",
  },
] as const;

export function Testimonials() {
  return (
    <Section bleed labelledBy="opiniones-titulo" className="bg-crudo/40">
      <div className="mx-auto w-full max-w-page px-[var(--container-gutter)]">
        <EditorialHeading as="h2" id="opiniones-titulo" className="text-3xl">
          Lo que dicen nuestras clientas
        </EditorialHeading>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <li key={testimonial.name} className="h-full">
              <Reveal className="h-full" delayMs={i * 70}>
                <figure className="flex h-full flex-col rounded-lg border border-hairline bg-marfil p-7 shadow-sm">
                  <span aria-hidden="true" className="font-display text-5xl leading-none text-barro">
                    “
                  </span>
                  <blockquote className="mt-2 flex-1 leading-[var(--leading-relaxed)] text-text-muted">
                    {testimonial.quote}
                  </blockquote>
                  <figcaption className="mt-5 border-t border-hairline pt-4 text-xs font-medium tracking-[0.14em] text-barro-hondo">
                    {testimonial.name}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
