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

  /* ---- grid parallax on pointer ---- */
  var grid = document.getElementById('grid');
  if (grid && !reduced && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 22;
      var y = (e.clientY / window.innerHeight - 0.5) * 22;
      grid.style.backgroundPosition = 'calc(50% + ' + x + 'px) calc(50% + ' + y + 'px)';
    }, { passive: true });
  }

  /* ---- mobile drawer ---- */
  var drawer = document.getElementById('drawer');
  var toggle = document.getElementById('navToggle');
  var closeBtn = document.getElementById('drawerClose');
  function setDrawer(open) {
    drawer.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setDrawer(true); });
  closeBtn.addEventListener('click', function () { setDrawer(false); });
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setDrawer(false);
  });
})();
