// portfolio-tweaks.jsx — Tweaks panel + DOM application for the Adizen portfolio.
// Content lives as plain HTML in index.html; this layer just flips data-attrs
// and CSS vars on the .pf root and updates the headline accent word.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "editorial",
  "hero": "light",
  "accent": ["#1436B4", "#86C1F4"],
  "accentWord": "intelligent",
  "photo": "circle",
  "weight": "700",
  "density": "regular",
  "showStats": true,
  "showJourney": true,
  "showProjects": true,
  "showToolkit": true
}/*EDITMODE-END*/;

function apply(t) {
  const pf = document.querySelector('.pf');
  if (!pf) return;
  pf.dataset.direction = t.direction;
  pf.dataset.hero = t.hero;
  pf.dataset.photo = t.photo;
  pf.dataset.density = t.density;
  pf.dataset.showStats = t.showStats ? '1' : '0';
  pf.dataset.showJourney = t.showJourney ? '1' : '0';
  pf.dataset.showProjects = t.showProjects ? '1' : '0';
  pf.dataset.showToolkit = t.showToolkit ? '1' : '0';

  const acc = Array.isArray(t.accent) ? t.accent : [t.accent, '#86C1F4'];
  pf.style.setProperty('--pf-accent', acc[0]);
  pf.style.setProperty('--pf-accent-2', acc[1] || '#86C1F4');
  pf.style.setProperty('--pf-display-w', t.weight);

  const word = document.querySelector('[data-accent-word]');
  if (word) word.textContent = t.accentWord || '';
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => { apply(t); }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Direction" />
      <TweakRadio label="Layout direction" value={t.direction}
        options={[{ value: 'editorial', label: 'Editorial' }, { value: 'bold', label: 'Bold' }]}
        onChange={(v) => setTweak('direction', v)} />
      <TweakRadio label="Hero background" value={t.hero}
        options={[{ value: 'light', label: 'Light' }, { value: 'blue', label: 'Blue' }, { value: 'black', label: 'Black' }]}
        onChange={(v) => setTweak('hero', v)} />

      <TweakSection label="Brand accent" />
      <TweakColor label="Accent emphasis" value={t.accent}
        options={[['#1436B4', '#86C1F4'], ['#E07B2E', '#E3D2BD'], ['#000000', '#86C1F4']]}
        onChange={(v) => setTweak('accent', v)} />

      <TweakSection label="Headline" />
      <TweakText label="Italic accent word" value={t.accentWord}
        placeholder="intelligent" onChange={(v) => setTweak('accentWord', v)} />

      <TweakSection label="Portrait & type" />
      <TweakRadio label="Photo shape" value={t.photo}
        options={[{ value: 'circle', label: 'Circle' }, { value: 'card', label: 'Card' }]}
        onChange={(v) => setTweak('photo', v)} />
      <TweakRadio label="Display weight" value={t.weight}
        options={[{ value: '700', label: 'Bold' }, { value: '800', label: 'Extra' }]}
        onChange={(v) => setTweak('weight', v)} />
      <TweakRadio label="Density" value={t.density}
        options={[{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Regular' }, { value: 'comfy', label: 'Comfy' }]}
        onChange={(v) => setTweak('density', v)} />

      <TweakSection label="Sections" />
      <TweakToggle label="Stats" value={t.showStats} onChange={(v) => setTweak('showStats', v)} />
      <TweakToggle label="Journey" value={t.showJourney} onChange={(v) => setTweak('showJourney', v)} />
      <TweakToggle label="Selected work" value={t.showProjects} onChange={(v) => setTweak('showProjects', v)} />
      <TweakToggle label="Toolkit" value={t.showToolkit} onChange={(v) => setTweak('showToolkit', v)} />
    </TweaksPanel>
  );
}

// Apply defaults immediately (before the panel ever opens) so the page renders
// in its configured state.
apply(TWEAK_DEFAULTS);

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<App />);

// Scroll reveal — progressive, never hides content if JS/observer is absent.
(function () {
  const els = document.querySelectorAll('.pf-reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach((e) => io.observe(e));
})();
