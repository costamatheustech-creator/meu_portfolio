/* Design System "Sage Dark" - comportamentos minimos da pagina de documentacao.
   Sem dependencias externas. */
(function () {
  'use strict';

  /* ---- abas ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-ds-tabs]'), function (group) {
    var tabs = group.querySelectorAll('.ds-tab');
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        Array.prototype.forEach.call(tabs, function (item) {
          item.setAttribute('aria-selected', String(item === tab));
        });
        var panelId = tab.getAttribute('aria-controls');
        Array.prototype.forEach.call(
          document.querySelectorAll('[data-ds-panel]'),
          function (panel) { panel.hidden = panel.id !== panelId; }
        );
      });
    });
  });

  /* ---- copiar token ao clicar ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (el) {
    el.addEventListener('click', function () {
      var value = el.getAttribute('data-copy');
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(value).then(function () {
        el.setAttribute('data-copied', 'true');
        window.setTimeout(function () { el.removeAttribute('data-copied'); }, 1200);
      });
    });
  });
}());
