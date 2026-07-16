// components/layout/SkipLink.tsx — AMARILLO. Skip-to-content (visible on focus;
// styles in styles/amarillo.css). Pages render <main id="contenido">.
export function SkipLink() {
  return (
    <a href="#contenido" className="skip-link">
      Saltar al contenido
    </a>
  );
}
