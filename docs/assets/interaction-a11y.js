/* Announce the scientific value shown beside a slider, not its integer UI scale. */
'use strict';
(() => {
  const pairs = [...document.querySelectorAll('input[type="range"][id]')].map(input => {
    const output = document.getElementById(input.id + '-value');
    return output?.tagName === 'OUTPUT' ? { input, output } : null;
  }).filter(Boolean);
  function sync({ input, output }) {
    const value = output.textContent.replace(/\s+/g, ' ').trim();
    if (value) input.setAttribute('aria-valuetext', value);
    else input.removeAttribute('aria-valuetext');
  }
  for (const pair of pairs) {
    // The focused slider already announces value changes. Avoid a second live announcement.
    pair.output.setAttribute('aria-live', 'off');
    sync(pair);
    const observer = new MutationObserver(() => sync(pair));
    observer.observe(pair.output, { childList: true, characterData: true, subtree: true });
  }
  const presets = [...document.querySelectorAll('[data-slider-target][data-slider-value]')];
  function markPresets() {
    for (const button of presets) {
      const input = document.getElementById(button.dataset.sliderTarget);
      button.setAttribute('aria-pressed', String(!!input && Number(input.value) === Number(button.dataset.sliderValue)));
    }
  }
  for (const button of presets) button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.sliderTarget);
    if (!input || input.type !== 'range') return;
    input.value = button.dataset.sliderValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    markPresets();
  });
  document.addEventListener('input', markPresets);
  markPresets();
})();
