// Scroll reveal for static portfolio deploys (preview/publish).
// Extracted from portfolio-tweaks.jsx — runs without React/Babel tweaks panel.
(function () {
  const els = document.querySelectorAll('.pf-reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((e) => io.observe(e));
})();
