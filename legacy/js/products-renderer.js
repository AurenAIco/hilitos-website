/* ============================================================
   HILITOS — Product Grid Renderer
   Reads window.HILITOS (defined in data/products.js).
   Re-callable via window.__hilitos_renderGrid() after live
   data arrives from the API.
   ============================================================ */

'use strict';

function renderProductGrid() {

  const grid = document.querySelector('.productos__grid');
  if (!grid) return;

  if (!window.HILITOS) {
    console.warn('[Hilitos] product database not loaded — check data/products.js');
    return;
  }

  console.log('[Hilitos] products loaded:', window.HILITOS_PRODUCTS ? window.HILITOS_PRODUCTS.length : 0);

  const WA_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

  function buildCard(product) {
    console.log('[Hilitos] Rendering product:', product.ref);

    const waLink    = HILITOS.orderLink(product.ref);
    const price     = HILITOS.formatPrice(product.price);
    const saleBadge = product.sale
      ? '<span class="product-card__sale-badge" aria-label="Oferta">SALE</span>'
      : '';

    return `
<article class="product-card${product.sale ? ' product-card--sale' : ''}">
  <div class="product-card__img-wrap">
    <img
      src="${product.image}"
      alt="Ref. ${product.ref} – Hilitos ajuar artesanal"
      class="product-card__img"
      loading="lazy"
    />
    ${saleBadge}
    <div class="product-card__overlay">
      <a
        href="${waLink}"
        target="_blank"
        rel="noopener noreferrer"
        class="product-card__quick-btn"
      >
        ${WA_ICON}
        Pedir por WhatsApp
      </a>
    </div>
  </div>
  <div class="product-card__info">
    <dl class="product-card__meta">
      <div class="product-card__meta-row">
        <dt>Talla</dt>
        <dd>${product.talla}</dd>
      </div>
      <div class="product-card__meta-row">
        <dt>Ref.</dt>
        <dd>${product.ref}</dd>
      </div>
    </dl>
    <p class="product-card__desc">${product.description}</p>
    <div class="product-card__footer">
      <span class="product-card__price${product.sale ? ' product-card__price--sale' : ''}">${price}</span>
      <a
        href="${waLink}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn--whatsapp btn--sm"
      >
        ${WA_ICON}
        Pedir
      </a>
    </div>
  </div>
</article>`.trim();
  }

  const featured = HILITOS.featured();
  grid.innerHTML = featured.map(buildCard).join('\n');

  console.log('[Hilitos] rendered', featured.length, 'product cards');

}

// Expose globally so data/products.js can call it after the live API fetch
window.__hilitos_renderGrid = renderProductGrid;

// Initial render on page load (uses static fallback data immediately)
renderProductGrid();
