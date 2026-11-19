# Global 200cc+ Motorcycle Brand Landscape

A static board of **39 motorcycle manufacturers worldwide** and their current 200cc+ models: 490 models across Japanese, European, American, other Asian and Chinese export brands. A scope switch in the model browser keeps a comparable **outside-China-only** view (34 brands / 417 models). Cross-filter by segment / displacement band / body type, search with several words, sort by displacement or name, and browse the brand wall, structural rankings, a body-type × displacement matrix and one static page per brand.

The UI follows the same dark industrial template as the China 250cc+ board: Auto/Light/Dark theme control (Auto follows the OS and is the default), brand favourites (localStorage), a right-hand brand drawer, bar charts that filter the model browser on click, a body-type × displacement cross-tab, an A-Z index, a garage wall, and a comparison drawer for 2–3 models. Every entry carries a source link back to the manufacturer's own line-up.

**Scope decisions**

- Manufacturers worldwide are in scope, including mainland-China brands (CFMOTO, QJMOTOR, Voge, Zontes, Kove) whose 200cc+ models are officially offered outside mainland China. Domestic-only models are excluded.
- The model browser has a **Scope** switch: worldwide (default) vs outside-China-only. Both statistics sets are pre-computed, so charts, rankings and the matrix follow the active scope.
- Only models of 200cc and above, using the manufacturer's official displacement figure.
- Trims and model years of one family are merged into one primary model.
- **No price list in this edition.** List prices differ by market and currency; inventing a single cross-market number would be worse than leaving it out, so price sorting and price bands are disabled.
- **No spec sheets in this edition.** The board is about brand and model coverage, displacement and body type.
- Brand marks come from Wikimedia Commons or the manufacturer site and are used for identification only; all trademarks remain with their owners.

Live site: <https://zhouyundi2006.github.io/moto-dashboard-global/>

## Repository layout

```
index.html                 single-page site (markup and styles)
src/app.ts                 front-end logic (TypeScript), bundled to dist/app.js
src/types.ts               data interfaces for the dashboard payload
dist/app.js                committed bundle loaded by index.html
build_global.py            validates data/global_brands.json and builds data/dashboard.js / dashboard.json
build_site.py              assembles the publishable site: _site/index.html + data + brand/*.html + sitemap.xml + robots.txt
data/global_brands.json    hand-maintained source data (the only file to edit)
data/dashboard.js          build output loaded by the front end (window.MOTO_DATA)
data/dashboard.json        build output, same content, for humans and scripts
data/specs.js              empty spec container (kept so the front end can load it)
assets/favicon.svg         site icon
stats_server.py            optional visit-stats backend (Flask + SQLite)
.github/workflows/pages.yml  validate + publish to GitHub Pages
```

## Front-end build

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run build       # esbuild -> dist/app.js (committed, so Pages needs no build step)
```

`dist/app.js` is committed deliberately: the Pages workflow stays Python-only and the site keeps working even if the Node toolchain is unavailable.

## Data pipeline

```bash
# validate only, write nothing (CI runs this and blocks the release on failure)
python3 build_global.py --check
# rebuild data/dashboard.js and data/dashboard.json
python3 build_global.py
# assemble _site
python3 build_site.py
```

`build_global.py` rejects duplicate brand ids or names, an unknown category, duplicate model names inside a brand, `cc` outside 199–3000, an unknown body type, or a model without a source. It derives the displacement band, per-brand model counts and the statistics used by the charts and the snapshot section.

## Fields

Brand: `id` `name` `nameEn` `company` `category` `subCategory` `group` `marketStatus` `website` `logo` `models` `modelCount` `uncertain` `sources` `note`

Model: `name` `cc` `type` `price` (always null in this edition) `priceMin` `priceMax` `priceFrom` `priceUnit` `source` `bucket`

`category` is one of `Japanese`, `European`, `American`, `Asian other`. `type` is one of `Sport`, `Naked`, `Cruiser`, `ADV`, `Scooter`, `Retro`, `Touring`, `Off-road`, `Other`.

## Deployment

Pushing to `main` runs `build_global.py --check`, then `build_site.py`, asserts the output (home-page version stamp, 30+ brand pages, sitemap) and publishes `_site` to GitHub Pages. The published site contains only the built HTML, data and brand pages.

## Visit stats backend (optional)

`stats_server.py` is included unchanged from the template: set `ADMIN_TOKEN`, `ALLOW_ORIGIN=https://zhouyundi2006.github.io` and run it behind HTTPS, then point the front end's `STATS_API` at it.

## Known trade-offs

- The model list is compiled from manufacturers' current official line-ups. Regional availability differs, so a model shown here may not be sold in every market.
- Prices and spec sheets are deliberately absent in this first edition; both are the natural next step, market by market.
- Brand marks are used only to identify the manufacturer; every trademark remains with its owner and no endorsement is implied.
