// Puts the saved store snapshot (docs/store-data.json) into site/index.html between the
// STORE-DATA markers, so every product page shows the store's own options, variants, images and description.
// Usage: node tools/build-site-data.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'store-data.json'), 'utf8'));
const out = {};
for (const p of data.products) {
  out[p.handle] = {
    o: (p.options[0] && p.options[0].name) || '',
    v: p.variants.map(v => [v.id, v.title, v.available ? 1 : 0, parseFloat(v.price)]),
    i: p.images.map(m => m.src),
    d: (p.description_html || '').trim()
  };
}
const file = path.join(root, 'site', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const start = '/* STORE-DATA:START */', end = '/* STORE-DATA:END */';
const a = html.indexOf(start), b = html.indexOf(end);
if (a < 0 || b < 0) throw new Error('markers not found in site/index.html');
const block = `${start}\nconst DOCS = ${JSON.stringify(out)};\n${end}`;
fs.writeFileSync(file, html.slice(0, a) + block + html.slice(b + end.length));
console.log('store data for', Object.keys(out).length, 'products written into site/index.html (snapshot', data.fetched_at.slice(0, 10) + ')');
