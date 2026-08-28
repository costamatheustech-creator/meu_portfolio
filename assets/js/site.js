(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- split headings into masked words ---- */
  document.querySelectorAll('h1.mask, h2.mask').forEach(function (el) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var words = child.nodeValue.split(/\s+/).filter(function (w) { return w !== ''; });
          if (!words.length) { node.removeChild(child); return; }
          var frag = document.createDocumentFragment();
          words.forEach(function (w) {
            var mask = document.createElement('span');
            mask.className = 'word';
            var inner = document.createElement('i');
            inner.style.transitionDelay = (150 + n++ * 90) + 'ms';
            inner.textContent = w;
            mask.appendChild(inner);
            frag.appendChild(mask);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
  });

  /* ---- reveal on scroll ---- */
  var targets = document.querySelectorAll("section, .project, .job, .stat, .case-block, .shot, .reveal, .mask");
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('is-visible'); });
  }

  /* ---- nav state + scroll progress ---- */
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle('scrolled', y > 24);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ---- mobile drawer ---- */
  var drawer = document.getElementById('drawer');
  var toggle = document.getElementById('navToggle');
  var closeBtn = document.getElementById('drawerClose');
  if (!drawer || !toggle || !closeBtn) return;

  // devolverFoco: ao fechar pelo X ou Esc o foco volta para o botao que
  // abriu. Ao seguir um link do menu, nao: o destino da ancora e que deve
  // receber o foco, e mexer nele cancelaria o salto.
  function setDrawer(open, devolverFoco) {
    drawer.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { closeBtn.focus(); }
    else if (devolverFoco) { toggle.focus(); }
  }
  toggle.addEventListener('click', function () { setDrawer(true); });
  closeBtn.addEventListener('click', function () { setDrawer(false, true); });
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false, false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      setDrawer(false, true);
      return;
    }
    // com o drawer aberto o Tab circula dentro dele, sem passear pelo
    // conteudo atras (que segue na arvore, apenas coberto)
    if (e.key !== 'Tab' || !drawer.classList.contains('open')) return;
    var focaveis = drawer.querySelectorAll('a[href], button');
    if (!focaveis.length) return;
    var primeiro = focaveis[0];
    var ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  });
})();
