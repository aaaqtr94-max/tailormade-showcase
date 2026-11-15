# Tailormade Case Showcase

Interactive iPhone 18 case shelf for tailormadeint.co: cases light up on hover, open with a cinematic fly-in, and the TM monogram writes itself in the background.

- `index.html` — the page. The block between `TAILORMADE SHOWCASE` and `END` is the code for a Shopify **Custom Liquid** section (place it right after the homepage hero).
- `deploy/` — what Netlify publishes. `netlify.toml` copies `index.html` into it on every deploy.
- `assets/tm-logo.jpg` — the source logo that was traced into the background animation.
- `serve.js` — local preview: `node serve.js`, then open http://localhost:5178

Live: https://tailormade-showcase.netlify.app — every push to `main` deploys automatically.
