/* Design System "Sage Dark" - comportamentos minimos da pagina de documentacao.
   Sem dependencias externas. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveal em scroll ---- */
  var targets = document.querySelectorAll('.ds-reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(targets, function (t) { io.observe(t); });
  } else {
    Array.prototype.forEach.call(targets, function (t) { t.classList.add('is-visible'); });
  }

  /* ---- header ganha blur ao rolar ---- */
  var header = document.querySelector('.ds-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('ds-header--blur', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- abas ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-ds-tabs]'), function (group) {
    var tabs = group.querySelectorAll('.ds-tab');
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        Array.prototype.forEach.call(tabs, function (t) {
          t.setAttribute('aria-selected', String(t === tab));
        });
        var panelId = tab.getAttribute('aria-controls');
        Array.prototype.forEach.call(
          document.querySelectorAll('[data-ds-panel]'),
          function (p) { p.hidden = p.id !== panelId; }
        );
      });
    });
  });

  /* ---- copiar token ao clicar ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (el) {
    el.addEventListener('click', function () {
      var value = el.getAttribute('data-copy');
      if (!navigator.clipboard) { return; }
      navigator.clipboard.writeText(value).then(function () {
        var previous = el.getAttribute('data-label') || '';
        el.setAttribute('data-copied', 'true');
        window.setTimeout(function () { el.removeAttribute('data-copied'); }, 1200);
        void previous;
      });
    });
  });
}());
