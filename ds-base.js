// Standalone loader — full DS tokens + fallback.
(() => {
  for (const href of ['./colors_and_type.css', './ds-tokens.css']) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }
})();
