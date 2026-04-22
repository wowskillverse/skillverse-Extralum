/**
 * Portada: al terminar el vídeo, último fotograma + botones (fade-in) para elegir imagen estática.
 */
(function () {
  'use strict';

  var root = document.getElementById('contenido-principal');
  if (!root) return;

  var video = root.querySelector('#extralum-hero-video');
  var imgA = root.querySelector('.extralum-hero-still-a');
  var imgB = root.querySelector('.extralum-hero-still-b');
  var bar = root.querySelector('.extralum-hero-bar');
  if (!video || !imgA || !imgB || !bar) return;

  var map = {
    champana: 'assets/Champaña.jpeg',
    natural: 'assets/Natural.jpeg',
    negra: 'assets/Negra.jpeg',
    nogal: 'assets/Nogal.jpeg',
  };

  var cache = {};
  var activeLayer = null;
  var transitioning = false;

  function preload(src) {
    if (cache[src]) return cache[src];
    cache[src] = new Promise(function (resolve, reject) {
      var i = new Image();
      i.decoding = 'async';
      i.onload = function () {
        if (typeof i.decode === 'function') {
          i.decode().catch(function () {}).finally(function () {
            resolve(src);
          });
          return;
        }
        resolve(src);
      };
      i.onerror = reject;
      i.src = src;
    });
    return cache[src];
  }

  function preloadAllFinishes() {
    Object.keys(map).forEach(function (k) {
      preload(map[k]).catch(function () {});
    });
  }

  function lockLastFrame() {
    try {
      video.pause();
    } catch (e) {}
    var d = video.duration;
    if (d && !isNaN(d) && isFinite(d)) {
      try {
        video.currentTime = Math.max(0, d - 0.05);
      } catch (err) {}
    }
  }

  video.addEventListener('ended', function () {
    lockLastFrame();
    bar.classList.add('extralum-hero-bar--visible');
    preloadAllFinishes();
  });

  function applySelection(btn, src) {
    if (transitioning) return;
    transitioning = true;

    var nextLayer = activeLayer === imgA ? imgB : imgA;
    nextLayer.classList.remove('extralum-hero-still--kenburns');
    var reveal = function () {
      nextLayer.removeAttribute('hidden');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          nextLayer.classList.add('extralum-hero-still--kenburns');
          nextLayer.classList.add('extralum-hero-still--visible');
          if (activeLayer) {
            activeLayer.classList.remove('extralum-hero-still--kenburns');
            activeLayer.classList.remove('extralum-hero-still--visible');
          }
          video.classList.add('extralum-hero-video--hidden');
          activeLayer = nextLayer;

          bar.querySelectorAll('button').forEach(function (b) {
            b.classList.remove('is-active');
          });
          btn.classList.add('is-active');
          transitioning = false;
        });
      });
    };

    if (nextLayer.getAttribute('src') === src && nextLayer.complete && nextLayer.naturalWidth > 0) {
      reveal();
      return;
    }

    nextLayer.src = src;
    if (typeof nextLayer.decode === 'function') {
      nextLayer.decode().catch(function () {}).finally(reveal);
      return;
    }
    if (nextLayer.complete && nextLayer.naturalWidth > 0) {
      reveal();
      return;
    }
    nextLayer.onload = reveal;
    nextLayer.onerror = function () {
      transitioning = false;
    };
  }

  bar.querySelectorAll('button[data-finish]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-finish');
      var src = map[key];
      if (!src) return;

      if (activeLayer && activeLayer.getAttribute('src') === src) {
        bar.querySelectorAll('button').forEach(function (b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');
        return;
      }

      preload(src)
        .then(function () {
          applySelection(btn, src);
        })
        .catch(function () {});
    });
  });
})();
