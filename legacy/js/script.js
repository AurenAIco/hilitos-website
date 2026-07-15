/* ============================================================
   HILITOS — Main JavaScript
   Vanilla JS · No dependencies · ES6+
   ============================================================ */

'use strict';

/* ============================================================
   1. NAVBAR — Scroll behavior + Mobile menu
   ============================================================ */

(function initNavbar() {
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburgerBtn');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('.navbar__mobile-link') : [];

  if (!navbar || !hamburger || !mobileMenu) return;

  /* --- Scroll: add/remove "scrolled" class ------------------- */
  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load in case page is already scrolled

  /* --- Hamburger toggle -------------------------------------- */
  function toggleMenu(forceClose) {
    const isOpen = hamburger.classList.contains('open');
    const shouldOpen = forceClose ? false : !isOpen;

    hamburger.classList.toggle('open', shouldOpen);
    mobileMenu.classList.toggle('open', shouldOpen);
    hamburger.setAttribute('aria-expanded', shouldOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!shouldOpen).toString());
  }

  hamburger.addEventListener('click', () => toggleMenu());

  /* Close mobile menu when a link is clicked */
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  /* Close mobile menu on outside click */
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
      toggleMenu(true);
    }
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') toggleMenu(true);
  });
})();


/* ============================================================
   2. SMOOTH SCROLL — Anchor links
   ============================================================ */

(function initSmoothScroll() {
  const NAV_HEIGHT = 70; // matches --nav-h CSS variable

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });

      // Move focus to section for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();


/* ============================================================
   3. FAQ ACCORDION
   ============================================================ */

(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      const isOpen = this.getAttribute('aria-expanded') === 'true';

      // Close all other items (accordion behavior)
      faqItems.forEach(otherItem => {
        const otherBtn    = otherItem.querySelector('.faq__question');
        const otherAnswer = otherItem.querySelector('.faq__answer');
        if (otherBtn && otherAnswer && otherItem !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.setAttribute('hidden', '');
        }
      });

      // Toggle current item
      if (isOpen) {
        this.setAttribute('aria-expanded', 'false');
        answer.setAttribute('hidden', '');
      } else {
        this.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
        // Scroll into view if partially hidden
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 420);
      }
    });

    // Keyboard accessibility: Enter / Space already handled by button
  });
})();


/* ============================================================
   4. PRODUCT CARDS — Add scroll reveal attributes dynamically
   ============================================================
   IMPORTANT: This MUST run before initScrollReveal() so the
   IntersectionObserver picks up all elements with data-reveal
   and data-reveal-stagger attributes.
   ============================================================ */

(function addRevealAttributes() {
  // Section headers
  document.querySelectorAll('.section__header').forEach(el => {
    el.setAttribute('data-reveal', '');
  });

  // Product grid — staggered
  // products-renderer.js has already injected cards before this runs
  const productGrids = document.querySelectorAll('.productos__grid');
  productGrids.forEach(grid => {
    grid.setAttribute('data-reveal-stagger', '');
  });

  // Nosotros image and content
  const nosotrosImg = document.querySelector('.nosotros__img-wrap');
  const nosotrosContent = document.querySelector('.nosotros__content');
  if (nosotrosImg) nosotrosImg.setAttribute('data-reveal', '');
  if (nosotrosContent) nosotrosContent.setAttribute('data-reveal', '');

  // Contact items — staggered
  const contactGrid = document.querySelector('.contacto__grid');
  if (contactGrid) contactGrid.setAttribute('data-reveal-stagger', '');

  // CTA final content
  const ctaContent = document.querySelector('.cta-final__content');
  if (ctaContent) ctaContent.setAttribute('data-reveal', '');

  // Lookbook grid
  const lookbookGrid = document.querySelector('.lookbook__grid');
  if (lookbookGrid) lookbookGrid.setAttribute('data-reveal', '');
})();


/* ============================================================
   5. SCROLL REVEAL — Intersection Observer
   ============================================================ */

(function initScrollReveal() {
  // Bail out for users who prefer reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Just show everything immediately
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const options = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, options);

  document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => {
    observer.observe(el);
  });
})();


/* ============================================================
   6. ACTIVE NAV LINK — Highlight current section
   ============================================================ */

(function initActiveNavLink() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.navbar__link');

  if (!sections.length || !navLinks.length) return;

  const NAV_HEIGHT = 80;

  function setActiveLink() {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY >= sectionTop - NAV_HEIGHT - 50) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();
})();


/* ============================================================
   7. LAZY LOAD IMAGES — Native fallback enhancement
   ============================================================ */

(function enhanceLazyLoad() {
  // Modern browsers handle loading="lazy" natively.
  // This provides a fallback for older browsers.
  if ('loading' in HTMLImageElement.prototype) return; // native support, skip

  const images = document.querySelectorAll('img[loading="lazy"]');

  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => imgObserver.observe(img));
})();


/* ============================================================
   8. BACK TO TOP BUTTON
   ============================================================ */

(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const SHOW_AFTER = 400; // px scrolled before button appears

  function onScroll() {
    if (window.scrollY > SHOW_AFTER) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   9. UTILITY — Current year in copyright
   ============================================================ */

(function updateCopyright() {
  const yearEls = document.querySelectorAll('.footer__copy');
  const year = new Date().getFullYear();
  yearEls.forEach(el => {
    el.innerHTML = el.innerHTML.replace(/\d{4}/, year);
  });
})();
