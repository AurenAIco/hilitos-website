// app/privacy/page.tsx — Privacy (AMARILLO visual structure only).
// Legal content is pending Mónica/legal (§13); the current policy remains
// live on the production site (master/GitHub Pages). No legal text is
// invented or ported without approval.
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { PendingBlock } from "@/components/editorial/PendingBlock";

export const metadata: Metadata = {
  title: "Privacidad",
};

export default function PrivacyPage() {
  return (
    <main id="contenido">
      <Section labelledBy="privacidad-titulo" className="pt-10 md:pt-14">
        <div className="max-w-2xl">
          <EditorialHeading as="h1" id="privacidad-titulo" className="text-3xl">
            Política de privacidad
          </EditorialHeading>
          <PendingBlock className="mt-6">
            Contenido legal pendiente de revisión (Mónica / legal). La política
            vigente sigue publicada en el sitio actual de hilitos.co.
          </PendingBlock>
        </div>
      </Section>
    </main>
  );
}
