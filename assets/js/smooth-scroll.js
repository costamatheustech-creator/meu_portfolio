(function () {
  'use strict';

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = null;

  /* Scroll wheel suave com fallback para o comportamento nativo. */
  if (!reducedMotion && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({
        duration: 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.25
      });
      window.lenis = lenis;
      (function raf(time) {
        if (!lenis) return;
        lenis.raf(time);
        window.requestAnimationFrame(raf);
      })();
    } catch (error) {
      lenis = null;
    }
  }

  function focusTarget(target) {
    var nativelyFocusable = target.matches('a,button,input,select,textarea,summary,[tabindex]');
    if (!nativelyFocusable) target.setAttribute('tabindex', '-1');
    try {
      target.focus({ preventScroll: true });
    } catch (error) {
      target.focus();
    }
    if (!nativelyFocusable) {
      target.addEventListener('blur', function () {
        target.removeAttribute('tabindex');
      }, { once: true });
    }
  }

  function scrollToTarget(target) {
    focusTarget(target);
    if (lenis) {
      if (lenis.resize) lenis.resize();
      lenis.scrollTo(target, { offset: -96, duration: 1.15 });
    } else {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function getSamePageTarget(anchor) {
    var href = anchor.getAttribute('href');
    if (!href) return null;
    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return null;
    }
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash || url.hash === '#') return null;
    var id;
    try {
      id = decodeURIComponent(url.hash.slice(1));
    } catch (error) {
      id = url.hash.slice(1);
    }
    return document.getElementById(id);
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var anchor = event.target.closest ? event.target.closest('a[href]') : null;
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
    var target = getSamePageTarget(anchor);
    if (!target) return;

    event.preventDefault();
    var url = new URL(anchor.href, window.location.href);
    if (window.location.hash !== url.hash) window.history.pushState(null, '', url.hash);
    scrollToTarget(target);
  });

  window.addEventListener('popstate', function () {
    if (!window.location.hash || window.location.hash === '#') return;
    var target;
    try {
      target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    } catch (error) {
      target = null;
    }
    if (target) scrollToTarget(target);
  });

  /* Scrollbar contextual: aparece durante a rolagem, usa a paleta do site e
     continua arrastável e navegável por teclado no desktop. Em telas touch,
     preservamos a barra nativa do sistema. */
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

  var rail = document.createElement('div');
  rail.id = 'site-scrollbar';
  rail.setAttribute('role', 'scrollbar');
  rail.setAttribute('aria-label', 'Posição da página');
  var controlledRegion = document.querySelector('main[id]');
  if (controlledRegion) rail.setAttribute('aria-controls', controlledRegion.id);
  rail.setAttribute('aria-orientation', 'vertical');
  rail.setAttribute('aria-valuemin', '0');
  rail.setAttribute('aria-valuenow', '0');
  rail.setAttribute('aria-valuemax', '0');
  rail.setAttribute('aria-valuetext', '0% da página');
  rail.setAttribute('tabindex', '0');
  rail.innerHTML = '<span class="site-scrollbar__track" aria-hidden="true"><span class="site-scrollbar__thumb"></span></span>';
  document.body.appendChild(rail);
  document.documentElement.classList.add('has-custom-scrollbar');

  var thumb = rail.querySelector('.site-scrollbar__thumb');
  var maxScroll = 0;
  var thumbHeight = 0;
  var trackHeight = 0;
  var dragOffset = 0;
  var dragging = false;
  var hideTimer = 0;

  function updateScrollbar() {
    var viewport = window.innerHeight;
    var scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    maxScroll = Math.max(0, scrollHeight - viewport);
    trackHeight = Math.max(0, viewport - 32);
    thumbHeight = maxScroll > 0 ? Math.min(trackHeight, Math.max(42, Math.round(trackHeight * viewport / scrollHeight))) : trackHeight;
    rail.classList.toggle('is-scrollable', maxScroll > 0);
    rail.classList.toggle('is-empty', maxScroll <= 0);
    document.documentElement.classList.toggle('has-custom-scrollbar', maxScroll > 0);

    var travel = Math.max(0, trackHeight - thumbHeight);
    var y = Math.max(0, Math.min(maxScroll, window.scrollY || document.documentElement.scrollTop || 0));
    var top = maxScroll > 0 ? (y / maxScroll) * travel : 0;
    thumb.style.height = thumbHeight + 'px';
    thumb.style.transform = 'translateY(' + Math.round(top) + 'px)';
    rail.setAttribute('aria-valuemax', String(Math.round(maxScroll)));
    rail.setAttribute('aria-valuenow', String(Math.round(y)));
    rail.setAttribute('aria-valuetext', Math.round(maxScroll ? (y / maxScroll) * 100 : 0) + '% da página');
  }

  function revealScrollbar() {
    if (maxScroll <= 0) return;
    rail.classList.add('is-visible');
    window.clearTimeout(hideTimer);
    if (!dragging) {
      hideTimer = window.setTimeout(function () {
        rail.classList.remove('is-visible');
      }, 850);
    }
  }

  function setScrollPosition(y, immediate) {
    var clamped = Math.max(0, Math.min(maxScroll, y));
    if (lenis) {
      lenis.scrollTo(clamped, immediate ? { immediate: true } : { duration: 0.65 });
    } else {
      document.documentElement.classList.toggle('scrollbar-dragging', !!immediate);
      window.scrollTo(0, clamped);
      if (immediate) {
        window.requestAnimationFrame(function () {
          document.documentElement.classList.remove('scrollbar-dragging');
        });
      }
    }
  }

  function scrollFromPointer(clientY) {
    var rect = rail.getBoundingClientRect();
    var travel = Math.max(1, trackHeight - thumbHeight);
    var top = Math.max(0, Math.min(travel, clientY - rect.top - dragOffset));
    setScrollPosition((top / travel) * maxScroll, true);
  }

  window.addEventListener('scroll', function () {
    updateScrollbar();
    revealScrollbar();
  }, { passive: true });
  window.addEventListener('resize', updateScrollbar, { passive: true });
  window.addEventListener('load', updateScrollbar, { passive: true });
  document.addEventListener('load', function (event) {
    if (event.target && event.target.tagName === 'IMG') updateScrollbar();
  }, true);
  if (window.ResizeObserver) {
    new ResizeObserver(updateScrollbar).observe(document.body);
  }

  rail.addEventListener('pointerdown', function (event) {
    if (event.button !== 0 || maxScroll <= 0) return;
    event.preventDefault();
    var isThumb = thumb.contains(event.target);
    var thumbRect = thumb.getBoundingClientRect();
    dragOffset = isThumb ? event.clientY - thumbRect.top : thumbHeight / 2;
    dragging = true;
    rail.classList.add('is-visible', 'is-dragging');
    window.clearTimeout(hideTimer);
    if (!isThumb) scrollFromPointer(event.clientY);
    if (rail.setPointerCapture) rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener('pointermove', function (event) {
    if (!dragging) return;
    event.preventDefault();
    scrollFromPointer(event.clientY);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    rail.classList.remove('is-dragging');
    revealScrollbar();
  }
  rail.addEventListener('pointerup', endDrag);
  rail.addEventListener('pointercancel', endDrag);
  rail.addEventListener('lostpointercapture', endDrag);

  rail.addEventListener('keydown', function (event) {
    var current = window.scrollY || document.documentElement.scrollTop || 0;
    var next = current;
    if (event.key === 'ArrowDown') next += 40;
    else if (event.key === 'ArrowUp') next -= 40;
    else if (event.key === 'PageDown' || event.key === ' ') next += window.innerHeight * 0.9;
    else if (event.key === 'PageUp') next -= window.innerHeight * 0.9;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = maxScroll;
    else return;
    event.preventDefault();
    setScrollPosition(next, false);
    revealScrollbar();
  });

  updateScrollbar();
})();
