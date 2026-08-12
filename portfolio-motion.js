/* Adizen portfolio — motion behaviours.
   Mirrors adizen.ai: text-roll hovers, word-by-word heading reveals.
   Progressive: if this file never loads, the page is still complete. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.querySelector('.pf');
  if (!root) return;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ---- text-roll: wrap a label in a 1-line mask holding two copies ---- */
  function makeRoll(el) {
    if (!el || el.querySelector('.pf-roll')) return;
    var txt = el.textContent.trim();
    if (!txt || el.children.length) return;      // only plain-text labels
    // Single-line chrome only — wrapping / long titles break the 1-line mask.
    if (txt.length > 48 || el.closest('.pf-card, .pf-feature-row')) return;
    el.textContent = '';
    var mask = document.createElement('span');
    mask.className = 'pf-roll';
    var inner = document.createElement('span');
    inner.className = 'pf-roll-in';
    var a = document.createElement('span');
    a.textContent = txt;
    var b = a.cloneNode(true);
    b.setAttribute('aria-hidden', 'true');
    inner.appendChild(a);
    inner.appendChild(b);
    mask.appendChild(inner);
    el.appendChild(mask);
  }

  /* ---- word split: every word becomes an inline-block, delay by line ---- */
  /* Idempotent: wraps only text not already wrapped, so it can re-run after
     the Tweaks panel rewrites the accent word. */
  function splitWords(el) {
    if (!el) return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var texts = [], n;
    while ((n = walker.nextNode())) texts.push(n);
    texts.forEach(function (t) {
      if (!t.textContent.trim()) return;
      if (t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('pf-w')) return;
      var frag = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var s = document.createElement('span');
        s.className = 'pf-w';
        s.textContent = p;
        frag.appendChild(s);
      });
      t.parentNode.replaceChild(frag, t);
    });
    el.classList.add('pf-split');
    cadence(el);
  }

  /* group words by visual line so a line's words share a delay */
  function cadence(el) {
    var words = [].slice.call(el.querySelectorAll('.pf-w'));
    var line = -1, lastTop = null;
    words.forEach(function (w) {
      var top = Math.round(w.getBoundingClientRect().top);
      if (lastTop === null || Math.abs(top - lastTop) > 6) { line++; lastTop = top; }
      w.style.setProperty('--wd', (line * 190) + 'ms');
    });
  }

  /* ---- accent word: an underline path that draws itself ---- */
  function drawAccent(em) {
    if (!em) return;
    var words = em.querySelectorAll('.pf-w');
    var hosts = words.length ? [].slice.call(words) : [em];
    hosts.forEach(function (host, i) {
      var existing = host.querySelector('.pf-accent-path');
      if (existing) return;
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'pf-accent-path');
      svg.setAttribute('viewBox', '0 0 100 6');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M0 5 L100 2');
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      p.setAttribute('pathLength', '1');
      svg.appendChild(p);
      /* each word draws in turn */
      svg.style.setProperty('--pd', (1.05 + i * 0.3).toFixed(2) + 's');
      host.appendChild(svg);
    });
  }

  ready(function () {
    /* text-roll: single-line chrome only (nav / buttons / contact).
       Never apply to .pf-card .ct — project titles wrap and the 1-line
       roll mask duplicates into an unreadable overlap. */
    document.querySelectorAll('.pf-nav a, .pf-btn, .pf-contact .link span')
      .forEach(makeRoll);

    if (reduce) {
      document.querySelectorAll('.pf-reveal').forEach(function (e) { e.classList.add('in'); });
      return;
    }

    /* word-split the two display headings only — keeps the rest editable */
    var heroH1 = document.querySelector('.pf-hero h1');
    var contactH2 = document.querySelector('.pf-contact h2');
    splitWords(heroH1);
    splitWords(contactH2);
    /* hero plays on load; contact waits for scroll */
    if (heroH1) requestAnimationFrame(function () { heroH1.classList.add('is-live'); });

    /* accent-word path draw */
    [heroH1, contactH2].forEach(function (h) {
      if (h) h.querySelectorAll('em').forEach(drawAccent);
    });

    /* the Tweaks panel rewrites the accent word — re-wrap when it does */
    [heroH1, contactH2].forEach(function (h) {
      if (!h || !window.MutationObserver) return;
      var pend;
      new MutationObserver(function () {
        clearTimeout(pend);
        pend = setTimeout(function () {
          splitWords(h);
          h.querySelectorAll('em').forEach(drawAccent);
        }, 40);
      }).observe(h, { childList: true, characterData: true, subtree: true });
    });
    if (contactH2) {
      var ch = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-live'); ch.disconnect(); } });
      }, { threshold: 0.4 });
      ch.observe(contactH2);
    }
    /* re-measure line groups if the heading rewraps */
    var rw;
    window.addEventListener('resize', function () {
      clearTimeout(rw);
      rw = setTimeout(function () { [heroH1, contactH2].forEach(function (e) { if (e) cadence(e); }); }, 180);
    });

    /* stagger reveals, nearest group wins */
    ['.pf-stats-grid', '.pf-timeline', '.pf-proj-grid', '.pf-kit', '.pf-journey-head', '.pf-section > .pf-wrap']
      .forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (g) {
          var i = 0;
          g.querySelectorAll('.pf-reveal').forEach(function (el) {
            if (el.style.getPropertyValue('--d')) return;
            el.style.setProperty('--d', (i++ * 130) + 'ms');
          });
        });
      });

    /* scroll-reveal: add .in (replaces standalone portfolio-reveal.js) */
    var revealEls = document.querySelectorAll('.pf-reveal');
    if (revealEls.length) {
      if (!('IntersectionObserver' in window)) {
        revealEls.forEach(function (e) { e.classList.add('in'); });
      } else {
        var revealIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            en.target.classList.add('in');
            revealIo.unobserve(en.target);
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach(function (e) { revealIo.observe(e); });
      }
    }

    /* scroll progress + sticky condense */
    var bar = document.createElement('div');
    bar.className = 'pf-progress';
    bar.setAttribute('aria-hidden', 'true');
    root.prepend(bar);

    var top = document.querySelector('.pf-top');
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h) : 0);
        if (top) top.classList.toggle('is-scrolled', y > 24);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* count-up numerals */
    document.querySelectorAll('.pf-stat .num').forEach(function (el) {
      var m = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
      if (!m) return;
      var target = parseInt(m[2], 10);
      if (target < 2) return;
      var pre = m[1], post = m[3];
      el.textContent = pre + '0' + post;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.disconnect();
          var dur = 900, t0 = null;
          (function step(t) {
            if (t0 === null) t0 = t;
            var p = Math.min(1, (t - t0) / dur);
            el.textContent = pre + Math.round(target * (1 - Math.pow(1 - p, 3))) + post;
            if (p < 1) requestAnimationFrame(step);
          })(performance.now());
        });
      }, { threshold: 0.6 });
      io.observe(el);
    });

    /* nav scrollspy */
    var links = [].slice.call(document.querySelectorAll('.pf-nav a[href^="#"]'));
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    if (sections.filter(Boolean).length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var i = sections.indexOf(en.target);
          links.forEach(function (a, j) { a.classList.toggle('is-active', j === i); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { if (s) spy.observe(s); });
    }

    /* toolkit group rules draw on reveal */
    var kit = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); kit.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.pf-kit-group').forEach(function (g) { kit.observe(g); });

    /* quiet portrait parallax */
    var portrait = document.querySelector('.pf-portrait');
    if (portrait) {
      var pt = false;
      window.addEventListener('scroll', function () {
        if (pt) return;
        pt = true;
        requestAnimationFrame(function () {
          var y = window.scrollY || 0;
          if (y < window.innerHeight * 1.2) portrait.style.setProperty('translate', '0 ' + (-y * 0.045).toFixed(1) + 'px');
          pt = false;
        });
      }, { passive: true });
    }
  });
})();
