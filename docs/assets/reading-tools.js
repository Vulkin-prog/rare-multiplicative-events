'use strict';
// Progressive enhancement: original section and chapter navigation works without JS.
(() => {
  const main = document.querySelector('main');
  if (!main || document.querySelector('[data-reading-tools-ready]')) return;
  const fr = document.documentElement.lang.toLowerCase().startsWith('fr');
  const t = (en, french) => fr ? french : en;
  const clean = text => (text || '').replace(/\s+/g, ' ').trim();
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const ownText = node => {
    const copy = node.cloneNode(true);
    copy.querySelectorAll('button,.katex-mathml,[aria-hidden="true"]').forEach(el => el.remove());
    return clean(copy.textContent);
  };
  function ensureId(node, prefix) {
    if (node.id) return node.id;
    let id = prefix, suffix = 2;
    while (document.getElementById(id)) id = prefix + '-' + suffix++;
    node.id = id;
    return id;
  }
  function sectionTarget(heading) {
    if (heading.id) return heading;
    let ancestor = heading.parentElement;
    while (ancestor && ancestor !== main) {
      if (ancestor.id) return ancestor;
      ancestor = ancestor.parentElement;
    }
    const slug = ownText(heading).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64);
    ensureId(heading, 'section-' + (slug || 'heading'));
    return heading;
  }
  const sections = [...main.querySelectorAll('h2')]
    .filter(h => !h.closest('.experiment,dialog,[role="dialog"],details'))
    .map(h => ({ target: sectionTarget(h), label: ownText(h) }))
    .filter((item, i, list) => list.findIndex(other => other.target === item.target) === i);
  const figures = [...main.querySelectorAll('.experiment')].map((figure, i) => {
    const heading = figure.querySelector('h3,.figure-label,.experiment-heading');
    const label = heading ? ownText(heading) : t('Interactive figure ', 'Figure interactive ') + (i + 1);
    // Stable numbered anchors are only introduced for older, unanchored workshops.
    ensureId(figure, 'figure-' + (i + 1));
    figure.classList.add('reading-figure-target');
    return { target: figure, label };
  });
  const existingNav = document.querySelector('.research-nav');
  const chapterMenu = document.querySelector('#contents-menu');
  const menus = [];
  let localLinks = [];

  function group(title, items, className) {
    const container = make('div', 'reading-tools-group ' + (className || ''));
    container.append(make('p', 'reading-tools-label', title));
    const list = make('ul', 'reading-tools-list');
    items.forEach(item => {
      const li = make('li');
      const link = make('a', '', item.label);
      link.setAttribute('href', '#' + item.target.id);
      li.append(link); list.append(li);
    });
    container.append(list);
    return container;
  }

  if (chapterMenu) {
    const panel = chapterMenu.querySelector('.contents-panel');
    if (panel && figures.length) {
      const figureGroup = group(t('Interactive figures', 'Figures interactives'), figures, 'reading-chapter-figures');
      const chapterGroup = panel.querySelector('.contents-group');
      if (chapterGroup && !chapterGroup.querySelector('p')) chapterGroup.prepend(make('p', '', t('Chapters', 'Chapitres')));
      panel.insertBefore(figureGroup, panel.querySelector('.contents-footer'));
      panel.classList.add('reading-enhanced-contents');
      localLinks = [...figureGroup.querySelectorAll('a')];
      menus.push(chapterMenu);
    }
    chapterMenu.dataset.readingToolsReady = 'true';
  } else if (sections.length) {
    const nav = existingNav || make('nav', 'reading-tools');
    nav.classList.add('reading-tools');
    nav.dataset.readingToolsReady = 'true';
    nav.setAttribute('aria-label', t('On this page', 'Dans cette page'));
    const row = make('div', 'reading-tools-row');
    // Move the original button, preserving its event listeners and dialog behavior.
    const utilities = existingNav ? [...existingNav.querySelectorAll('button')] : [];
    const menu = make('details', 'reading-tools-menu');
    const summary = make('summary');
    summary.append(make('span', 'reading-tools-title', t('On this page', 'Dans cette page')));
    summary.append(make('span', 'reading-tools-count', sections.length + t(' sections', ' rubriques') + (figures.length ? ' · ' + figures.length + t(' figures', ' figures') : '')));
    const chevron = make('span', 'reading-tools-chevron', '⌄');
    chevron.setAttribute('aria-hidden', 'true'); summary.append(chevron);
    const panel = make('div', 'reading-tools-panel');
    panel.append(group(t('Reading', 'Lecture'), sections));
    if (figures.length) panel.append(group(t('Interactive figures', 'Figures interactives'), figures));
    else panel.classList.add('reading-tools-single');
    menu.append(summary, panel); row.append(menu);
    const activeLevel = document.querySelector('.corpus-level [aria-current="page"]');
    if (activeLevel) row.append(make('span', 'reading-tools-context', /intuition/i.test(activeLevel.textContent) ? t('Guided reading', 'Lecture guidée') : t('Research brief', 'Synthèse de recherche')));
    utilities.forEach(button => row.append(button));
    nav.replaceChildren(row);
    if (!existingNav) {
      const firstHeading = main.querySelector('h2');
      let insertion = firstHeading;
      while (insertion.parentElement && insertion.parentElement !== main && !insertion.parentElement.classList.contains('shell')) insertion = insertion.parentElement;
      insertion.before(nav);
    }
    localLinks = [...panel.querySelectorAll('a')];
    menus.push(menu);
  }

  function reveal(target) {
    let ancestor = target.parentElement;
    while (ancestor) {
      if (ancestor.tagName === 'DETAILS') ancestor.open = true;
      ancestor = ancestor.parentElement;
    }
  }
  function focusTarget(target) {
    const heading = target.matches('h2,h3') ? target : target.querySelector('h2,h3');
    const focus = heading || target;
    if (!focus.hasAttribute('tabindex')) focus.setAttribute('tabindex', '-1');
    focus.focus({ preventScroll: true });
  }
  menus.forEach(menu => {
    document.addEventListener('click', event => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false; menu.querySelector('summary').focus({ preventScroll: true }); event.preventDefault();
      }
    });
    menu.addEventListener('focusout', event => { if (event.relatedTarget && !menu.contains(event.relatedTarget)) menu.open = false; });
  });
  localLinks.forEach(link => link.addEventListener('click', () => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    menus.forEach(menu => { menu.open = false; });
    reveal(target);
    // Native hash navigation retains browser history and also works in the offline export.
    requestAnimationFrame(() => focusTarget(target));
  }));

  const offline = Boolean(window.CORPUS_OFFLINE) || location.protocol === 'file:';
  figures.forEach(({ target, label }) => {
    const header = target.querySelector('.experiment-header,.experiment-heading') || target;
    const tools = make('div', 'reading-figure-tools');
    const button = make('button', 'reading-copy-link', offline ? t('Copy figure anchor', 'Copier le repère') : t('Copy figure link', 'Copier le lien'));
    button.type = 'button';
    button.setAttribute('aria-label', button.textContent + ' · ' + label);
    const status = make('span', 'reading-copy-status');
    status.setAttribute('role', 'status');
    const fallback = make('div', 'reading-copy-fallback');
    fallback.hidden = true;
    const fieldLabel = make('label', '', t('Select and copy this address:', 'Sélectionnez et copiez cette adresse :'));
    const field = make('input'); field.type = 'text'; field.readOnly = true;
    field.setAttribute('aria-label', offline ? t('Figure anchor', 'Repère de la figure') : t('Figure address', 'Adresse de la figure'));
    fieldLabel.append(field); fallback.append(fieldLabel);
    tools.append(button, status, fallback); header.append(tools);
    let clearStatus;
    button.addEventListener('click', async () => {
      const fragment = '#' + encodeURIComponent(target.id);
      const address = offline ? fragment : location.href.split('#')[0] + fragment;
      fallback.hidden = true; status.textContent = ''; clearTimeout(clearStatus);
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard unavailable');
        await navigator.clipboard.writeText(address);
        status.textContent = offline ? t('Anchor copied.', 'Repère copié.') : t('Link copied.', 'Lien copié.');
        clearStatus = setTimeout(() => { status.textContent = ''; }, 5000);
      } catch {
        status.textContent = t('Copy manually below.', 'Copiez manuellement ci-dessous.');
        field.value = address; fallback.hidden = false; field.focus(); field.select();
      }
    });
  });

  // Generated figure anchors must also work when loaded directly, including inside disclosures.
  function revealFragment() {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target || !target.matches('.reading-figure-target,[id^="section-"]')) return;
    reveal(target);
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  window.addEventListener('hashchange', revealFragment);
  if (location.hash) revealFragment();
})();
