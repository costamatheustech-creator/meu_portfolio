(function () {
  'use strict';

  /* ---- menu do header ---- */
  var nav = document.getElementById('nav');
  var drawer = document.getElementById('drawer');
  var toggle = document.getElementById('navToggle');
  if (!drawer || !toggle) return;

  var firstLink = drawer.querySelector('.drawer-links a[href]');

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


/* ---- navegação manual dos feedbacks (sem animação de entrada) ---- */
(function () {
  'use strict';

  var slider = document.querySelector('[data-feedback-slider]');
  if (!slider) return;

  var slides = Array.prototype.slice.call(slider.querySelectorAll('.feedback-slide'));
  var controls = slider.querySelector('[data-feedback-controls]');
  var previous = slider.querySelector('[data-feedback-prev]');
  var next = slider.querySelector('[data-feedback-next]');
  if (slides.length < 2 || !controls || !previous || !next) return;

  var current = 0;
  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.hidden = slideIndex !== current;
    });
  }

  previous.addEventListener('click', function () { showSlide(current - 1); });
  next.addEventListener('click', function () { showSlide(current + 1); });
  showSlide(current);
  controls.hidden = false;
})();
