/* ============================================================
   HILITOS — Product Database
   ============================================================
   Loads live data from api.hilitos.com/products (Supabase).
   Falls back to the static catalog below if the API is unreachable.

   Usage:
     HILITOS.get('2257')          // single product
     HILITOS.featured()           // grid products (featured + available)
     HILITOS.search('beige')      // search
     HILITOS.orderLink('2257')    // WhatsApp link
   ============================================================ */

'use strict';

(function () {

  const WA_NUMBER = '573053560882';
  const BASE_IMG  = '/images/productos/';
  const API_URL   = 'https://api.hilitos.com/products';

  /* ── Static fallback catalog (shown instantly; replaced by live API data) ── */

  let catalog = {

    '2257': {
      ref:         '2257',
      name:        'Estuche Saco con Capa',
      description: 'Estuche tejido artesanal en colores pastel, muy querido por las familias para recibir al bebé.',
      talla:       'RN',
      price:       82000,
      colors:      ['Amarillo', 'Verde Agua', 'Beige', 'Blanco'],
      image:       BASE_IMG + '2257.jpg',
      keywords:    ['estuche', 'saco', 'capa', 'gorro', 'mitones', 'pantalón', 'rn', 'recién nacido', 'amarillo', 'verde agua', '2257'],
      featured:    true,
    },

    '2258': {
      ref:         '2258',
      name:        'Estuche Tejido Clásico',
      description: 'Ajuar clásico artesanal tejido a mano. Incluye saco, pantalón con pie cubierto, gorro y mitones en hilo suave.',
      talla:       'RN',
      price:       93200,
      colors:      ['Beige', 'Blanco', 'Verde Agua', 'Rosa'],
      image:       BASE_IMG + '2258.jpg',
      keywords:    ['estuche', 'saco', 'clásico', 'pantalón', 'gorro', 'mitones', 'rn', 'recién nacido', 'beige', 'blanco', '2258'],
      featured:    true,
    },

    '2809': {
      ref:         '2809',
      name:        'Set Premium Recién Nacido',
      description: 'Nuestro set premium con acabados especiales. Saco, pantalón, gorro, mitones y body interior para la llegada más especial.',
      talla:       'RN',
      price:       59900,
      sale:        true,
      colors:      ['Blanco', 'Beige', 'Café'],
      image:       BASE_IMG + '2809.jpg',
      keywords:    ['set', 'premium', 'saco', 'pantalón', 'gorro', 'mitones', 'body', 'rn', 'recién nacido', 'blanco', '2809'],
      featured:    true,
    },

    '2810': {
      ref:         '2810',
      name:        'Conjunto Tejido Natural',
      description: 'Elaborado en fibra natural 100%. Transpirable, suave al tacto y amigable con la piel más delicada del recién nacido.',
      talla:       'RN',
      price:       91900,
      colors:      ['Natural', 'Beige'],
      image:       BASE_IMG + '2810.jpg',
      keywords:    ['conjunto', 'natural', 'fibra', 'transpirable', 'suave', 'rn', 'recién nacido', 'beige', '2810'],
      featured:    true,
    },

    '2817': {
      ref:         '2817',
      name:        'Conjunto Unisex Artesanal',
      description: 'Mameluco unisex con capa bordada y gorro para niño o balaca para niña, ideal para regalo de baby shower.',
      talla:       '0',
      price:       64900,
      colors:      ['Beige', 'Blanco', 'Azul', 'Rosa', 'Café'],
      image:       BASE_IMG + '2817.jpg',
      keywords:    ['conjunto', 'unisex', 'niño', 'niña', 'baby shower', 'regalo', 'mameluco', 'capa', '0', '2817'],
      featured:    true,
    },

    '2823': {
      ref:         '2823',
      name:        'Ajuar Baby Shower',
      description: 'Bata tejida para bebé presentada en gancho colgado.',
      talla:       'RN',
      price:       83900,
      colors:      ['Beige', 'Blanco', 'Rosa', 'Azul'],
      image:       BASE_IMG + '2823.jpg',
      keywords:    ['ajuar', 'baby shower', 'regalo', 'bata', 'rn', 'recién nacido', '2823'],
      featured:    true,
    },

    '4091': {
      ref:         '4091',
      name:        'Set Hospital Recién Nacido',
      description: 'Pensado para el momento de llegar al mundo. Suave, cómodo y tejido con amor. Perfecto para las primeras fotos en el hospital.',
      talla:       'RN',
      price:       109900,
      colors:      ['Blanco', 'Beige', 'Rosa', 'Azul'],
      image:       BASE_IMG + '4091.jpg',
      keywords:    ['set', 'hospital', 'llegada', 'fotos', 'newborn', 'rn', 'recién nacido', 'blanco', '4091'],
      featured:    true,
    },

    '4105': {
      ref:         '4105',
      name:        'Estuche Newborn Fotografía',
      description: 'Mameluco para niña con medias tejidas, camiseta y gorro tejido, perfecto para sesión de fotos.',
      talla:       '3 meses',
      price:       106600,
      colors:      ['Beige', 'Blanco', 'Rosa'],
      image:       BASE_IMG + '4105.jpg',
      keywords:    ['estuche', 'newborn', 'fotografía', 'fotos', 'sesión', 'mameluco', 'medias', '3m', 'beige', 'rosa', '4105'],
      featured:    true,
    },

    '4111': {
      ref:         '4111',
      name:        'Conjunto Artesanal Bebé',
      description: 'Conjunto unisex en estuche con saco, pantalón, medias, body y gorro tejido.',
      talla:       'RN',
      price:       86900,
      colors:      ['Azul', 'Beige', 'Blanco', 'Rosa'],
      image:       BASE_IMG + '4111.jpg',
      keywords:    ['conjunto', 'artesanal', 'bebé', 'saco', 'pantalón', 'medias', 'body', 'gorro', 'rn', 'azul', '4111'],
      featured:    true,
    },

    /* ── En base de datos, no en cuadrícula principal ──────── */

    '4114': {
      ref:         '4114',
      name:        'Estuche Especial Niña',
      description: 'Estuche artesanal para bebé niña con detalles especiales. Tejido a mano con mucho amor.',
      talla:       'RN',
      price:       89000,
      colors:      ['Blanco', 'Rosa', 'Beige', 'Rojo'],
      image:       BASE_IMG + '4114.jpg',
      keywords:    ['estuche', 'niña', 'especial', 'rn', 'recién nacido', 'rosa', 'blanco', '4114'],
      featured:    false,
    },

    '1449': {
      ref:         '1449',
      name:        'Set Artesanal Clásico',
      description: 'Set artesanal de tres piezas. Saco, pantalón y gorro tejidos en hilo suave natural.',
      talla:       'RN',
      price:       74000,
      colors:      ['Beige', 'Blanco'],
      image:       BASE_IMG + '1449.jpg',
      keywords:    ['set', 'artesanal', 'clásico', 'saco', 'pantalón', 'gorro', 'rn', 'beige', '1449'],
      featured:    false,
    },

  };

  /* ── Public API (reads from mutable `catalog`) ────────────── */

  window.HILITOS = {

    all() {
      return Object.values(catalog);
    },

    featured() {
      return Object.values(catalog).filter(p => p.featured && p.available !== false);
    },

    get(ref) {
      return catalog[String(ref)] || null;
    },

    search(query) {
      const q = query.toLowerCase();
      return Object.values(catalog).filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.colors || []).some(c => c.toLowerCase().includes(q)) ||
        p.ref.includes(q) ||
        (p.keywords || []).some(k => k.toLowerCase().includes(q))
      );
    },

    orderLink(ref) {
      const p = catalog[String(ref)];
      if (!p) return `https://wa.me/${WA_NUMBER}`;
      const text = encodeURIComponent(
        `Hola, me interesa la referencia ${p.ref} – ${p.name}`
      );
      return `https://wa.me/${WA_NUMBER}?text=${text}`;
    },

    formatPrice(amount) {
      return new Intl.NumberFormat('es-CO', {
        style:                 'currency',
        currency:              'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },

  };

  /* ── Global product list for AI agent / external access ───── */
  window.HILITOS_PRODUCTS = Object.values(catalog);

  /* ── Live sync from Supabase via API ──────────────────────── */
  // Map API (Supabase) field names to the format the renderer expects.
  function mapApiProduct(p) {
    return {
      ref:         String(p.ref),
      name:        p.name || '',
      description: p.description || '',
      talla:       p.talla || 'RN',
      price:       Number(p.price) || 0,
      colors:      Array.isArray(p.colors) ? p.colors : [],
      // image_url (Supabase) → image (renderer); fall back to local asset
      image:       p.image_url || (BASE_IMG + p.ref + '.jpg'),
      keywords:    Array.isArray(p.keywords) ? p.keywords : [],
      featured:    p.featured !== false,
      available:   p.available !== false,
      sale:        !!p.sale,
    };
  }

  fetch(API_URL)
    .then(function(r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function(json) {
      const list = Array.isArray(json) ? json : (json.products || []);
      if (!list.length) return;

      const newCatalog = {};
      for (const p of list) {
        newCatalog[String(p.ref)] = mapApiProduct(p);
      }
      catalog = newCatalog;
      window.HILITOS_PRODUCTS = Object.values(catalog);

      // Re-render the product grid with live data
      if (typeof window.__hilitos_renderGrid === 'function') {
        window.__hilitos_renderGrid();
      }
    })
    .catch(function() {
      // Silent fail — static fallback catalog already shown
    });

})();
