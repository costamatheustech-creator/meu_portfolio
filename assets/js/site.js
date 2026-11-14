(function () {
  'use strict';

  /* ---- estado da navegacao + progresso de leitura ---- */
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- menu do header ---- */
  var drawer = document.getElementById('drawer');
  var toggle = document.getElementById('navToggle');
  if (!drawer || !toggle) return;

  var firstLink = drawer.querySelector('a[href]');

  function setDrawer(open, returnFocus) {
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (nav) nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';

    if (window.lenis) {
      if (open && window.lenis.stop) window.lenis.stop();
      else if (!open && window.lenis.start) window.lenis.start();
    }

    if (open && firstLink) firstLink.focus();
    else if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', function () {
    var opening = !drawer.classList.contains('open');
    setDrawer(opening, !opening);
  });

  drawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setDrawer(false, false); });
  });

  document.addEventListener('keydown', function (event) {
    if (!drawer.classList.contains('open')) return;
    if (event.key === 'Escape') {
      setDrawer(false, true);
      return;
    }
    if (event.key !== 'Tab') return;

    var focusable = drawer.querySelectorAll('a[href], button');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
