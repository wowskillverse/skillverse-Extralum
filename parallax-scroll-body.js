/**
 * EP Parallax Scroll Body
 * Fondo SVG fijo + efecto solo por scroll.
 * El progreso va de 0 (top) a 1 (final del body).
 */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  let rafPending = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getBodyScrollProgress() {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const scrollMax = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    return clamp(scrollTop / scrollMax, 0, 1);
  }

  function applyParallax() {
    const svgRoot = document.querySelector('.ep-fixed-bg-wrap svg');
    if (!svgRoot) {
      rafPending = false;
      return;
    }

    const progress = getBodyScrollProgress();
    const centered = progress - 0.5;

    const layers = svgRoot.querySelectorAll('[data-parallax-scroll]');
    layers.forEach(function (layer) {
      const amount = parseFloat(layer.dataset.parallaxScroll);
      const distance = isNaN(amount) ? 0 : amount;
      const ty = centered * distance * 2;
      layer.style.transform = 'translate3d(0,' + ty.toFixed(2) + 'px,0)';
    });

    rafPending = false;
  }

  function queueUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(applyParallax);
  }

  function inlineFixedSvg(imgEl) {
    return fetch(imgEl.src)
      .then(function (r) { return r.text(); })
      .then(function (svgText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (!svgEl) return;

        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.classList.add('ep-fixed-bg');

        imgEl.parentNode.replaceChild(svgEl, imgEl);
      });
  }

  function init() {
    const fixedWrap = document.querySelector('.ep-fixed-bg-wrap');
    if (!fixedWrap) return;

    const img = fixedWrap.querySelector('img.ep-fixed-bg[src$=".svg"]');
    const start = function () {
      window.addEventListener('scroll', queueUpdate, { passive: true });
      window.addEventListener('resize', queueUpdate);
      queueUpdate();
    };

    if (!img) {
      start();
      return;
    }

    inlineFixedSvg(img).then(start).catch(start);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
