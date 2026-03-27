/**
 * EP Parallax — SVG parallax por mouse y por scroll
 * Vanilla JS, sin dependencias, compatible con WordPress.
 *
 * Uso básico (SVG inline):
 *   Añadir en cada <g> o elemento SVG que quieras animar:
 *     data-parallax-mouse="0.05"   → intensidad movimiento por mouse (0 = nulo, 0.2 = mucho)
 *     data-parallax-scroll="60"   → píxeles máximos de desplazamiento por scroll
 *
 * Uso con capas HTML (.ep-layer):
 *   <div class="ep-layer" data-parallax-mouse="0.04" data-parallax-scroll="40"></div>
 */
(function () {
  'use strict';

  /* ── Respeta prefers-reduced-motion ─────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Configuración global (editar aquí para ajustar) ─────── */
  const CONFIG = {
    mouseEnabled: !reducedMotion,
    scrollEnabled: !reducedMotion,
    /* Suavizado: 1 = inmediato, 0.05 = muy suave */
    lerpFactor: 0.07,
    /* Atenuación adicional en móviles (pointer: coarse) */
    mobileMouseMultiplier: 0.4,
  };

  /* ── Detección de puntero grueso (móvil / táctil) ────────── */
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const mouseMultiplier = coarsePointer ? CONFIG.mobileMouseMultiplier : 1;

  /* ── Estado ──────────────────────────────────────────────── */
  let mouseX = 0; // -1 … 1 relativo al viewport
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let rafId = null;

  /* ── Recopilar capas ─────────────────────────────────────── */
  function getLayers(root) {
    return Array.from(
      root.querySelectorAll('[data-parallax-mouse], [data-parallax-scroll]')
    );
  }

  /* ── Leer atributos de intensidad ────────────────────────── */
  function getIntensity(el, attr) {
    const val = parseFloat(el.dataset[attr]);
    return isNaN(val) ? 0 : val;
  }

  /* ── Calcular progreso de scroll del contenedor hero ──────── */
  function getScrollProgress(hero) {
    const rect = hero.getBoundingClientRect();
    const viewH = window.innerHeight;
    // 0 cuando entra por abajo, 1 cuando sale por arriba
    const total = rect.height + viewH;
    const progress = (viewH - rect.top) / total;
    return Math.max(0, Math.min(1, progress));
  }

  /* ── Loop de animación ───────────────────────────────────── */
  function tick(hero, layers) {
    /* Suavizar mouse */
    mouseX += (targetMouseX - mouseX) * CONFIG.lerpFactor;
    mouseY += (targetMouseY - mouseY) * CONFIG.lerpFactor;

    const scrollProgress = CONFIG.scrollEnabled ? getScrollProgress(hero) : 0;
    /* Centro de scroll: 0.5 = hero centrado = sin desplazamiento */
    const scrollOffset = scrollProgress - 0.5;

    layers.forEach(function (layer) {
      const mIntensity = getIntensity(layer, 'parallaxMouse') * mouseMultiplier;
      const sIntensity = getIntensity(layer, 'parallaxScroll');

      let tx = 0;
      let ty = 0;

      if (CONFIG.mouseEnabled) {
        tx += mouseX * mIntensity * window.innerWidth  * 0.5;
        ty += mouseY * mIntensity * window.innerHeight * 0.5;
      }

      if (CONFIG.scrollEnabled) {
        ty += scrollOffset * sIntensity;
      }

      layer.style.transform = 'translate3d(' + tx.toFixed(2) + 'px, ' + ty.toFixed(2) + 'px, 0)';
    });

    rafId = requestAnimationFrame(function () { tick(hero, layers); });
  }

  /* ── Listener de mouse ───────────────────────────────────── */
  function onPointerMove(e) {
    /* Normalizar a -1 … 1 desde el centro */
    targetMouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  /* ── Inicialización ──────────────────────────────────────── */
  function init() {
    const hero = document.querySelector('.ep-hero');
    if (!hero) return;

    /* SVG puede estar inline (dentro del DOM) o como <img>.
       Si es <img>, intentamos cargarlo inline para poder animar capas internas. */
    const svgImg = hero.querySelector('img.ep-svg[src$=".svg"]');
    if (svgImg) {
      inlineSVG(svgImg, function () {
        startParallax(hero);
      });
    } else {
      startParallax(hero);
    }
  }

  function startParallax(hero) {
    const layers = getLayers(hero);
    if (!layers.length) {
      console.warn('[EP Parallax] No se encontraron capas con data-parallax-* en .ep-hero');
      return;
    }

    if (CONFIG.mouseEnabled) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    rafId = requestAnimationFrame(function () { tick(hero, layers); });
  }

  /* ── Cargar SVG externo como inline ─────────────────────── */
  function inlineSVG(imgEl, callback) {
    fetch(imgEl.src)
      .then(function (r) { return r.text(); })
      .then(function (svgText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (!svgEl) { callback(); return; }

        /* Preservar clases del img */
        svgEl.classList.add('ep-svg-inline');
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.style.width  = '100%';
        svgEl.style.height = '100%';
        svgEl.style.display = 'block';

        imgEl.parentNode.replaceChild(svgEl, imgEl);
        callback();
      })
      .catch(function () {
        console.warn('[EP Parallax] No se pudo cargar SVG inline. Parallax desactivado para capas internas.');
        callback();
      });
  }

  /* ── Arrancar cuando el DOM esté listo ───────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Limpieza (útil para SPA / React / Vue dentro de WP) ─── */
  window.epParallaxDestroy = function () {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('pointermove', onPointerMove);
  };

})();
