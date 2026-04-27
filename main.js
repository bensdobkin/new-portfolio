(function () {
  'use strict';

  function setActiveNav() {
    var links = document.querySelectorAll('.site-nav__link');
    if (!links.length) return;

    var path = window.location.pathname;
    var active = 'case-studies';

    if (/\/about\.html$/.test(path)) {
      active = 'about';
    } else if (/\/playground\.html$/.test(path)) {
      active = 'playground';
    } else if (/\/other-work(-pages)?(\/|\.html$)/.test(path)) {
      active = 'other-work';
    } else if (/\/case-studies\//.test(path)) {
      active = 'case-studies';
    } else if (/\/other-work\.html$/.test(path)) {
      active = 'other-work';
    }

    links.forEach(function (link) {
      if (link.getAttribute('data-page') === active) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function initPlaygroundCanvas() {
    var viewport = document.getElementById('playground');
    if (!viewport) return;
    var canvas = viewport.querySelector('.playground__canvas');
    if (!canvas) return;

    var x = 0, y = 0;
    var dragging = false;
    var pointerId = null;
    var startX = 0, startY = 0, baseX = 0, baseY = 0;
    var movedDist = 0;
    var DRAG_THRESHOLD = 5;
    var worldW = 0, worldH = 0;
    var tilingInitialized = false;
    var TILE_PADDING = 80;

    function wrap(v, period) {
      if (!period || period <= 0) return v;
      var r = v % period;
      if (r > 0) r -= period;
      return r;
    }

    function applyTransform() {
      var wx = wrap(x, worldW);
      var wy = wrap(y, worldH);
      canvas.style.transform = 'translate3d(' + wx + 'px, ' + wy + 'px, 0)';
      viewport.style.setProperty('--bg-x', wx + 'px');
      viewport.style.setProperty('--bg-y', wy + 'px');
    }

    function originalTiles() {
      return canvas.querySelectorAll('.playground__tile:not([data-clone])');
    }

    function measureWorld() {
      var items = originalTiles();
      if (!items.length) return null;
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      items.forEach(function (item) {
        var ix = parseFloat(getComputedStyle(item).getPropertyValue('--x')) || 0;
        var iy = parseFloat(getComputedStyle(item).getPropertyValue('--y')) || 0;
        var iw = parseFloat(getComputedStyle(item).getPropertyValue('--w')) || item.offsetWidth;
        var ih = parseFloat(getComputedStyle(item).getPropertyValue('--h')) || item.offsetHeight;
        if (ix < minX) minX = ix;
        if (iy < minY) minY = iy;
        if (ix + iw > maxX) maxX = ix + iw;
        if (iy + ih > maxY) maxY = iy + ih;
      });
      return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    }

    function setupInfiniteTiling() {
      if (tilingInitialized) return;
      var bounds = measureWorld();
      if (!bounds) return;
      worldW = (bounds.maxX - bounds.minX) + TILE_PADDING;
      worldH = (bounds.maxY - bounds.minY) + TILE_PADDING;
      if (worldW <= 0 || worldH <= 0) return;
      var tiles = Array.prototype.slice.call(originalTiles());
      for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          tiles.forEach(function (t) {
            var ix = parseFloat(getComputedStyle(t).getPropertyValue('--x')) || 0;
            var iy = parseFloat(getComputedStyle(t).getPropertyValue('--y')) || 0;
            var clone = t.cloneNode(true);
            clone.setAttribute('data-clone', 'true');
            clone.setAttribute('aria-hidden', 'true');
            clone.style.setProperty('--x', (ix + dx * worldW) + 'px');
            clone.style.setProperty('--y', (iy + dy * worldH) + 'px');
            canvas.appendChild(clone);
          });
        }
      }
      tilingInitialized = true;
    }

    function center() {
      var bounds = measureWorld();
      if (!bounds) return;
      var rect = viewport.getBoundingClientRect();
      x = rect.width / 2 - (bounds.minX + bounds.maxX) / 2;
      y = rect.height / 2 - (bounds.minY + bounds.maxY) / 2;
      applyTransform();
    }

    viewport.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      movedDist = 0;
      startX = e.clientX;
      startY = e.clientY;
      baseX = x;
      baseY = y;
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pointerId) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > movedDist) movedDist = dist;
      x = baseX + dx;
      y = baseY + dy;
      applyTransform();
    });

    function endDrag(e) {
      if (!dragging) return;
      if (e && e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      viewport.classList.remove('is-dragging');
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('lostpointercapture', endDrag);

    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      x -= e.deltaX;
      y -= e.deltaY;
      applyTransform();
    }, { passive: false });

    viewport.addEventListener('click', function (e) {
      if (movedDist > DRAG_THRESHOLD) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);

    viewport.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });

    function setup() {
      setupInfiniteTiling();
      center();
    }

    if (document.readyState === 'complete') {
      setup();
    } else {
      window.addEventListener('load', setup);
    }
    window.addEventListener('resize', center);
  }

  function initLightbox() {
    var gallery = document.getElementById('playground');
    if (!gallery) return;

    var items = Array.prototype.slice.call(gallery.querySelectorAll('.playground__item'));
    if (!items.length) return;

    var sources = items.map(function (item) {
      return item.getAttribute('data-src') || '';
    });

    var overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.innerHTML = [
      '<button type="button" class="lightbox__btn lightbox__btn--close" aria-label="Close">&times;</button>',
      '<button type="button" class="lightbox__btn lightbox__btn--prev" aria-label="Previous image">&larr;</button>',
      '<button type="button" class="lightbox__btn lightbox__btn--next" aria-label="Next image">&rarr;</button>',
      '<div class="lightbox__stage"></div>'
    ].join('');

    document.body.appendChild(overlay);

    var stage = overlay.querySelector('.lightbox__stage');
    var closeBtn = overlay.querySelector('.lightbox__btn--close');
    var prevBtn = overlay.querySelector('.lightbox__btn--prev');
    var nextBtn = overlay.querySelector('.lightbox__btn--next');

    var currentIndex = 0;

    function render(index) {
      currentIndex = (index + sources.length) % sources.length;
      var src = sources[currentIndex];
      stage.innerHTML = '';

      var img = document.createElement('img');
      img.className = 'lightbox__image';
      img.alt = 'Image ' + (currentIndex + 1) + ' of ' + sources.length;
      img.src = src;
      img.onerror = function () {
        var placeholder = document.createElement('div');
        placeholder.className = 'lightbox__image lightbox__image--placeholder';
        stage.innerHTML = '';
        stage.appendChild(placeholder);
      };
      stage.appendChild(img);
    }

    function open(index) {
      render(index);
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove('is-open');
      stage.innerHTML = '';
      document.body.style.overflow = '';
    }

    gallery.addEventListener('click', function (e) {
      var target = e.target.closest('.playground__item');
      if (!target) return;
      var index = parseInt(target.getAttribute('data-index'), 10) || 0;
      open(index);
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { render(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { render(currentIndex + 1); });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') render(currentIndex - 1);
      else if (e.key === 'ArrowRight') render(currentIndex + 1);
    });
  }

  function initCaseStudyTOC() {
    var rail = document.querySelector('.case-study__rail');
    if (!rail) return;

    var links = Array.prototype.slice.call(rail.querySelectorAll('.case-study__rail-item'));
    if (!links.length) return;

    var targets = [];
    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var id = href.replace(/^#/, '');
      var el = id ? document.getElementById(id) : null;
      if (el) targets.push({ id: id, el: el, link: link });
    });
    if (!targets.length) return;

    function setActive(id) {
      links.forEach(function (link) {
        var href = link.getAttribute('href') || '';
        link.classList.toggle('is-active', href === '#' + id);
      });
    }

    var suppressObserver = false;
    var releaseTimer;

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href') || '';
        if (href === '#overview') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setActive(href.replace(/^#/, ''));
        suppressObserver = true;
        clearTimeout(releaseTimer);
        releaseTimer = setTimeout(function () {
          suppressObserver = false;
        }, 900);
      });
    });

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      if (suppressObserver) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    targets.forEach(function (t) { observer.observe(t.el); });
  }

  function initThemeToggle() {
    var buttons = document.querySelectorAll('.theme-toggle');
    if (!buttons.length) return;

    function currentTheme() {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function applyTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      try { localStorage.setItem('theme', theme); } catch (e) {}
      buttons.forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(theme === 'dark'));
      });
    }

    applyTheme(currentTheme());

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      });
    });
  }

  function initHeroStagger() {
    var headline = document.querySelector('.hero__headline');
    if (!headline) return;

    var walker = document.createTreeWalker(headline, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) textNodes.push(node);

    var i = 0;
    textNodes.forEach(function (textNode) {
      var parts = textNode.nodeValue.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          var span = document.createElement('span');
          span.className = 'hero__word';
          span.style.setProperty('--i', i++);
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });

    var hero = headline.closest('.hero');
    if (hero) {
      var lastDelay = (i - 1) * 30;
      hero.style.setProperty('--subline-delay', (lastDelay + 120) + 'ms');
      hero.classList.add('is-staggered');
    }
  }

  function init() {
    setActiveNav();
    initPlaygroundCanvas();
    initLightbox();
    initCaseStudyTOC();
    initThemeToggle();
    initHeroStagger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
