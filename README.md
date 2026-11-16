# TAILORMADE

Site and Shopify sections for tailormadeint.co.

Live: https://tailormade-showcase.netlify.app — every push to `main` rebuilds it (`netlify.toml` runs `tools/build-deploy.sh`).

| Address | Page | Source |
|---|---|---|
| `/` | the full TAILORMADE site: opening film, 3D TM monogram, products, product pages | `site/index.html` |
| `/shopify-preview/` | the Shopify sections, rendered with the store snapshot | `shopify/preview/index.html` |
| `/showcase/` | the case shelf | `index.html` |
| `/experience/` | the earlier single-page version | `experience/index.html` |

- `shopify/` — what goes into the store's theme: `sections/tm-opening.liquid`, `sections/tm-product-grid.liquid`, `snippets/tm-bag-icon.liquid`, and the Arabic install guide `README-AR.md`. Products, prices and stock come live from the store.
- `assets/video/` — the background films (`bg-wide` for wide screens, `bg-tall` for phones).
- `docs/` — snapshot of the store (products, collections, theme) taken 2026-11-15.
- `serve.js` — local preview: `node serve.js`, then open http://localhost:5178 (same addresses as above, e.g. `/shopify-preview/`).
