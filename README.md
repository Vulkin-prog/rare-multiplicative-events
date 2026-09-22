# Rare multiplicative events — public corpus

A static research and teaching site by Brice Pouly. The home page is the English corpus overview. Each of the four research papers has a precise English research brief and separate French/English intuition pages. Global navigation separates the paper, reading level, language and theme.

## Public editions

| Text | Version-specific DOI |
| --- | --- |
| Paper C V3 | 10.5281/zenodo.22872154 |
| Lattice Poisson Flows V2 | 10.5281/zenodo.22876520 |
| Arithmetic Clusters V1 | 10.5281/zenodo.22877400 |
| Moving Prime Environments V1 | 10.5281/zenodo.22878806 |
| Corpus overview V1 | 10.5281/zenodo.22880994 |
| Paper C Lean release v0.49.0 | 10.5281/zenodo.22875443 |

Manuscripts and technical companions are linked to their version-specific Zenodo records. No PDF files are stored in this repository or embedded in the standalone export. The sources page documents the Lean release separately: 89 selected declarations in seven families, relative to seven explicit literature inputs. It makes no formalization claim for the whole corpus.

## Routes

- `docs/index.html`: corpus overview, two reading routes and the exact two-window model.
- `docs/paper-c.html`: binary arithmetic, uniform/typical dictionaries, complete signed fields, empirical counts and boundary extremes.
- `docs/flows.html`: records, censoring, occupation, scale flows and signed Gaussian observations.
- `docs/clusters.html`: prime sources and fixed environments; observation extensions are identified separately.
- `docs/environments.html`: moving phases on a fixed finite exceptional prime set, effective profiles, spatial identification and window geometry.
- `docs/sources.html`: exact editions, manuscript/companion links, formalization scope and BibTeX.
- `*-intuition.html` and `*-intuition-en.html`: corresponding FR/EN guided pages. C and LPF now have separate guided scopes.
- `docs/intuition.html`, `docs/en.html`: compatibility redirects for previously shared chapter links. Previous root research anchors also retain their destinations.
- `docs/arithmetique_du_hasard_autonome.html`: a self-contained export of all 16 reading views, fonts, styles, scripts and bibliography. Manuscripts open on Zenodo.

## Publish with GitHub Pages

The complete website is in `docs/`. This repository uses GitHub Pages branch publishing, with no external build service or package installation.

One-time activation by the repository owner:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Select branch **main**, folder **/docs**, then **Save**.
4. Wait for the **pages build and deployment** run to succeed. GitHub shows the published address on the same settings page.

Expected public address after activation: <https://vulkin-prog.github.io/rare-multiplicative-events/>. Every later push to `main` updates the site automatically. Readers need no GitHub or ChatGPT account.

All internal URLs are relative, so they work under the repository subpath. `.nojekyll` preserves the supplied static files. No domain purchase is needed.

This repository was private when the transfer was completed. GitHub Pages on a private personal repository requires GitHub Pro (or another eligible plan). The repository's visibility has not been changed. See [GitHub's publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Preview locally

```sh
python3 -m http.server 8000 --directory docs
```

Open <http://localhost:8000/>. The standalone file also works when opened directly from disk. Normal multipage browsing downloads only the assets needed by the current page; the larger standalone file is an optional offline download.

## Editing and export

The site uses plain HTML, CSS, SVG and classic JavaScript. KaTeX and WOFF2 fonts are bundled locally. No package install or build step is required to serve `docs/`.

After changing a route or asset, regenerate the standalone file:

```sh
python3 scripts/export-standalone.py
```

This export is tracked and published as a downloadable website asset. It uses a fresh document on each route to isolate the existing interaction engines. It preserves theme and chapter-aware language navigation, embeds the BibTeX download, and supports legacy view parameters. Manuscripts, DOI and GitHub links require connectivity; reading pages and mathematical calculations do not.

## Mathematical models

Exact finite calculations, finite random arithmetic samples and limiting Poisson-target laws are labelled separately. Prime signs determine all integer signs by complete multiplicativity. Run starts exclude the initial run unless explicitly stated. Records preserve the earliest holder on ties and count an episode once when recognized. Prime-source corrections and exact environment-only removal are kept distinct from expectation centering. Moving environments keep the exceptional prime set fixed. Full covariance measures, scalar variances and total counts have different identification scopes.

New models are in `assets/corpus-labs-math.js`, `moving-math.js` and `flow-compression-math.js`; their UI is in `corpus-labs.js`. Older validated C, LPF and AC demonstrators remain in their own modules. Shared navigation styles and behavior are in `corpus.css` and `corpus.js`; the public edition register is `corpus-manifest.json`.

## Validation

```sh
python3 scripts/check-site.py
node scripts/check-corpus.cjs
node scripts/check-clusters.cjs
```


The transfer checks verify local HTML/CSS references and fragments under a repository subpath, duplicate IDs, version-specific Zenodo destinations, all 16 embedded offline views, embedded BibTeX bytes and the absence of stored or embedded PDFs. The two existing numerical checks cover count moments, brute-force finite-strip counts, cluster laws, strict endpoints and covariance calculations. This transfer does not constitute a new review of the mathematical manuscripts. Browser rendering and physical-phone behavior were not directly tested; layouts and controls retain the existing responsive and reduced-motion rules.

## Transfer provenance

The `docs/` files derive from source commit `b952d051bfddf0fdc780a47ce8e812799af73710`, retrieved on 22 September 2026. As requested, all PDFs were excluded, manuscript links now open the corresponding Zenodo records, and the standalone export was regenerated without embedded PDFs. `.nojekyll` was added for Pages. The export and numerical-check scripts were adapted from `dist/` to `docs/`. `SITE-SHA256SUMS` records the transferred website bytes. The original hosted site is unchanged.
