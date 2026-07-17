// app/(admin)/admin/page.tsx — /admin (ADM1a-S2).
// Owner: ADM1a. Minimal, non-sensitive, honest structural placeholder.
//
// Server component only: no client JS, no data fetching, no business,
// catalog, customer, or operational data of any kind. Inherits
// force-dynamic + noindex,nofollow from app/(admin)/layout.tsx (S1) — not
// re-declared here.
//
// Reachable only when the S2 middleware's provisional cookie check passes
// (or is bypassed by direct navigation before any cookie exists — the
// content below must stay harmless regardless, since middleware is never
// security authority — INV-1/INV-3 arrive in Slice S3). Never describe
// this page as securely authenticated: cookie presence is not
// authentication or authorization.
export default function AdminPage() {
  return (
    <main id="admin-contenido">
      <h1>Panel administrativo</h1>
      <p>
        Superficie administrativa en construcción; la verificación de sesión
        llega en una fase posterior.
      </p>
      <p className="admin-status" aria-live="polite">
        Esta página no requiere ni realiza verificación de identidad todavía.
      </p>
    </main>
  );
}
