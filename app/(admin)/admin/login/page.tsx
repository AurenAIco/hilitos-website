// app/(admin)/admin/login/page.tsx — /admin/login (ADM1a-S2).
// Owner: ADM1a. Minimal, honest, non-functional restricted-access shell.
//
// Server component only: no client JS, no data fetching. Deliberately
// contains NO form element, NO disabled controls, NO email input, and
// nothing that submits or looks functional — a working login arrives only
// in Slice S3 (invite-only email OTP, per the Mission Pack §9/§10).
// Wording is identical for every visitor regardless of any account state
// (INV-18-compatible non-enumeration), since no account lookup of any kind
// happens on this page. Inherits force-dynamic + noindex,nofollow from
// app/(admin)/layout.tsx (S1) — not re-declared here.
//
// Reachable without a cookie by design (the S2 middleware's login
// carve-out — see lib/admin/routing.ts) so this honest placeholder is
// always what an unauthenticated visitor lands on, never a redirect loop.
export default function AdminLoginPage() {
  return (
    <main id="admin-contenido">
      <h1>Acceso administrativo</h1>
      <p>Acceso restringido solo por invitación.</p>
      <p className="admin-status" aria-live="polite">
        El inicio de sesión aún no está habilitado; la autenticación llega en
        una fase posterior.
      </p>
    </main>
  );
}
