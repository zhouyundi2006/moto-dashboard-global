# Global 200cc+ Motorcycle Brand Landscape

A static board of motorcycle manufacturers based **outside mainland China** and their current 200cc+ models: 34 brands and 255 models across Japanese, European, American and other Asian makers. Cross-filter by segment / displacement band / body type, search with several words, sort by displacement or name, and browse the brand wall, structural rankings, a body-type × displacement matrix and one static page per brand.

The UI follows the same dark industrial template as the China 250cc+ board: light/dark toggle, brand favourites (localStorage), a right-hand brand drawer, bar charts that filter the model browser on click, a body-type × displacement cross-tab, an A-Z index, a garage wall, and a comparison drawer for 2–3 models. Every entry carries a source link back to the manufacturer's own line-up.

**Scope decisions**

- Only manufacturers headquartered outside mainland China. Chinese brands — CFMOTO, QJMOTOR, Kove, Voge, Zontes, Benelli's parent and others — are out of scope, whatever market they sell in.
- Only models of 200cc and above, using the manufacturer's official displacement figure.
- Trims and model years of one family are merged into one primary model.
- **No price list in this edition.** List prices differ by market and currency; inventing a single cross-market number would be worse than leaving it out, so price sorting and price bands are disabled.
- **No spec sheets in this edition.** The board is about brand and model coverage, displacement and body type.
- Brand artwork is not copied: brands are shown as wordmarks.

Live site: <https://zhouyundi2006.github.io/moto-dashboard-global/>

## Repository layout

```
index.html                 single-page site (styles and logic inlined)
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
- Brands are represented by wordmarks rather than copied logos to keep the published repository free of third-party artwork.
