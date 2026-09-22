'use strict';
(() => {
  // Filenames, edition labels and physical page counts checked against the
  // public Zenodo records and PDFs on 2026-09-22. No PDF is bundled with the site.
  const documents = Object.freeze([
    {id:'overview', record:'22880994', title:'Corpus overview', version:'1.2', kind:'main', pages:16, file:'article_chapeau_v1_2_en.pdf'},
    {id:'long-runs', record:'22872154', title:'Long runs', version:'3', kind:'main', pages:67, file:'paper_c_version_3_en(1).pdf'},
    {id:'long-runs-companion', record:'22872154', title:'Long runs', version:'3', kind:'companion', pages:44, file:'paper_c_version_3_technical_companion_en(1).pdf'},
    {id:'flows', record:'22876520', title:'Records and scale flows', version:'2.1', kind:'main', pages:41, file:'lattice_poisson_flows_v2_1_en.pdf'},
    {id:'flows-companion', record:'22876520', title:'Records and scale flows', version:'2.1', kind:'companion', pages:36, file:'lattice_poisson_flows_v2_1_technical_companion_en.pdf'},
    {id:'clusters', record:'22877400', title:'Arithmetic clusters', version:'1.1', kind:'main', pages:62, file:'poisson_laws_arithmetic_clusters_v1_1_en.pdf'},
    {id:'environments', record:'22878806', title:'Moving prime environments', version:'1', kind:'main', pages:49, file:'moving_prime_environments_v1_en.pdf'}
  ].map(Object.freeze));
  const filename = d => encodeURIComponent(d.file).replace(/\(/g,'%28').replace(/\)/g,'%29');
  // The public file endpoint sends an attachment. Zenodo's own PDF.js preview
  // supports #page=N (open_pdf.js); use that reader for precise page navigation.
  const previewURL = (d, page=1) => `https://zenodo.org/records/${d.record}/preview/${filename(d)}#page=${page}`;
  const downloadURL = d => `https://zenodo.org/records/${d.record}/files/${filename(d)}?download=1`;
  window.CorpusSourceLinks = Object.freeze({documents, previewURL, downloadURL});

  for (const link of document.querySelectorAll('a[href]')) {
    const match = link.textContent.trim().match(/^(Manuscript|Manuscrit|Technical companion|Compagnon technique)\s*·\s*Zenodo$/i);
    if (!match) continue;
    const record = link.getAttribute('href').match(/^https:\/\/zenodo\.org\/records\/(\d+)\/?$/);
    if (!record) continue;
    const kind = /companion|compagnon/i.test(match[1]) ? 'companion' : 'main';
    const source = documents.find(d => d.record === record[1] && d.kind === kind);
    if (!source) continue;
    link.href = previewURL(source);
    link.textContent = `${match[1]} PDF · Zenodo`;
    link.title = `${source.title} · V${source.version} · ${kind === 'companion' ? 'Technical companion' : 'Manuscript'} · PDF`;
  }

  const firstSource = document.getElementById('source-overview');
  if (!firstSource || document.getElementById('source-reader')) return;
  const panel = document.createElement('section');
  panel.className = 'source-reader';
  panel.id = 'source-reader';
  panel.setAttribute('aria-labelledby','source-reader-title');
  panel.innerHTML = `<p class="eyebrow">From the brief to the proof</p>
    <h2 id="source-reader-title">Open a source at a specific page</h2>
    <p>Choose the manuscript or its technical companion. The reader opens on Zenodo in a new tab.</p>
    <div class="source-reader-controls">
      <label for="source-document">Document<select id="source-document"></select></label>
      <label for="source-page">PDF page<input id="source-page" type="number" inputmode="numeric" min="1" step="1" value="1" aria-describedby="source-page-help source-page-status"></label>
    </div>
    <p id="source-page-status" class="source-reader-status" role="status" aria-live="polite" aria-atomic="true"></p>
    <div class="resource-links"><a id="source-open" class="button primary" target="_blank" rel="noopener">Open PDF reader ↗</a><a id="source-download" class="button" target="_blank" rel="noopener">Download this PDF ↗</a></div>
    <p id="source-page-help" class="source-reader-help">PDF pages are counted from the first page (1), including the title page; printed page numbers can differ. These links need an internet connection.</p>`;
  firstSource.before(panel);
  const select = panel.querySelector('#source-document');
  const page = panel.querySelector('#source-page');
  const status = panel.querySelector('#source-page-status');
  const open = panel.querySelector('#source-open');
  const download = panel.querySelector('#source-download');
  documents.forEach(d => {
    const option = document.createElement('option');
    option.value = d.id;
    if (d.id === documents[0].id) option.setAttribute('selected','');
    option.textContent = `${d.title} · V${d.version} · ${d.kind === 'companion' ? 'Companion' : 'Manuscript'}`;
    select.append(option);
  });
  function update() {
    const source = documents.find(d => d.id === select.value) || documents[0];
    page.max = String(source.pages);
    download.href = downloadURL(source);
    const value = Number(page.value);
    const valid = page.value.trim() !== '' && Number.isInteger(value) && value >= 1 && value <= source.pages;
    page.setAttribute('aria-invalid',String(!valid));
    open.setAttribute('aria-disabled',String(!valid));
    if (valid) {
      open.href = previewURL(source,value);
      open.textContent = `Open PDF at page ${value} ↗`;
      status.textContent = `${source.title} · ${source.kind === 'companion' ? 'Technical companion' : 'Manuscript'} · Page ${value} of ${source.pages}.`;
    } else {
      open.removeAttribute('href');
      open.textContent = 'Choose a valid PDF page';
      status.textContent = `Enter a whole page number from 1 to ${source.pages}.`;
    }
  }
  select.addEventListener('change',() => {page.value='1'; update();});
  page.addEventListener('input',update);
  update();
})();
