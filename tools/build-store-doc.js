// Builds docs/STORE-DETAILS.md (readable) from docs/store-data.json and docs/store-theme.json.
// Usage: node tools/build-store-doc.js
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'docs');
const data = JSON.parse(fs.readFileSync(path.join(dir, 'store-data.json'), 'utf8'));
const th = JSON.parse(fs.readFileSync(path.join(dir, 'store-theme.json'), 'utf8'));
const L = [];
const P = s => L.push(s);
const cell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ');
const money = v => 'QAR ' + Number(v).toFixed(2).replace('.', ',');
const byHandle = new Map(data.products.map(p => [p.handle, p]));

P('# TAILORMADE — store details');
P('');
P(`Snapshot of **${data.store}** taken ${data.fetched_at.slice(0, 10)}. Raw data: \`store-data.json\` (products, collections) and \`store-theme.json\` (theme, header, homepage, pages, policies).`);
P('');
P('## 1. Store at a glance');
P('');
P(`| | |\n|---|---|`);
P(`| Platform | Shopify, theme **${cell(th.theme.name)}** (id ${th.theme.theme_id}) |`);
P(`| Currency / locale / country | ${th.theme.currency} / ${th.theme.locale} / ${th.theme.country} |`);
P(`| Products | ${data.products.length} (${data.products.reduce((a, p) => a + p.variants.length, 0)} variants, ${data.products.reduce((a, p) => a + p.images.length, 0)} images) |`);
P(`| Sold out | ${data.products.filter(p => !p.variants.some(v => v.available)).length} products fully sold out |`);
P(`| Collections | ${data.collections.length - 1} (+ "all") |`);
P(`| Pages | ${(th.pages || []).map(p => p.url.replace(data.store, '')).join(', ')} |`);
P('');

P('## 2. Look and feel');
P('');
P(`- **Fonts loaded:** ${th.theme.fonts_loaded.join(', ')}`);
P(`- **Body text:** ${th.theme.body.fontFamily}, ${th.theme.body.fontSize}, colour ${th.theme.body.color} on ${th.theme.body.backgroundColor}`);
P('- **Measured layout (desktop):** page side padding 40px; product grid 4 columns, 16px gap; zoom-out view 7 columns; product card text padding 20px; card corner radius 10px; titles and prices 14px Instrument Sans.');
P('- **Measured layout (phone):** product grid 2 columns edge to edge, 12px gap; optional single column; page title 48px.');
P('- **Page titles:** Instrument Serif, 65.45px desktop / 48px phone, weight 400.');
P('- **"Sold out" badge:** black pill, white 13px text, padding 4px 10px, radius 40px, 8px from the top-left of the image.');
P('- **Quick-add button:** 36px round, bottom-right of the image (12.8px inset), bag icon, label "Choose"; desktop only.');
P('');
const vars = (o, title) => { const e = Object.entries(o || {}); if (!e.length) return; P(`<details><summary>${title} (${e.length})</summary>\n`); P('| Variable | Value |\n|---|---|'); e.forEach(([k, v]) => P(`| \`${k}\` | ${cell(v)} |`)); P('\n</details>\n'); };
vars(th.theme.font_vars, 'Font variables');
vars(th.theme.color_vars, 'Colour variables');
vars(th.theme.size_vars, 'Size and spacing variables');

P('## 3. Header');
P('');
P(`- **Announcement bar:** "${th.header.announcement}" → links to \`${th.header.announcement_link}\``);
P(`- **Logo:** text "${th.header.logo_text}" linking home; header height ${th.header.height}px.`);
P(`- **Menu:**`);
th.header.menu.forEach(m => P(`  - ${m.text} → \`${m.href}\``));
P(`- **Icons / controls:** ${th.header.icons.join(', ')}`);
P('- **Desktop menu shows:** Home, Best Selling, Shop, More. **More** opens a panel with Watch Roll Collection, iPhone 18 / 17 / Air / 16 / 15 Series and four featured products (TAILORMADE X ALOSTTRAVELER | iPhone 17 Series; Pepita Houndstooth | Black & White; iPhone 18 HFC | Tan (Edition II); iPhone 18 HFC | Burgundy (Edition ll)).');
P('');

P('## 4. Homepage, top to bottom');
P('');
th.home.sections.forEach((s, i) => {
  P(`### 4.${i + 1} ${s.type}`);
  P(`- Section id: \`${s.id}\` · height ${s.height}px · background ${s.bg ? s.bg.backgroundColor : ''}`);
  if (s.text) P(`- Text: ${cell(s.text).slice(0, 400)}`);
  if (s.images.length) P(`- Images: ${s.images.map(im => `[${im.alt || 'image'}](${im.src.startsWith('//') ? 'https:' + im.src : im.src})`).join(', ')}`);
  if (s.links.length) P(`- Links: ${s.links.slice(0, 15).map(l => `${cell(l.text) || '(icon)'} → \`${l.href}\``).join('; ')}`);
  P('');
});
if (th.home.hero_caption_style) P(`- **Hero caption style:** ${th.home.hero_caption_style.fontFamily} ${th.home.hero_caption_style.fontSize} ${th.home.hero_caption_style.fontStyle}, ${th.home.hero_caption_style.color}`);
(th.home.newsletter_form || []).forEach(f => P(`- **Newsletter form:** posts to \`${f.action}\` with ${f.fields.join(', ')}`));
P('');

P('## 5. Collections');
P('');
P('| Collection | Handle | Products | Default sort | Description |\n|---|---|---|---|---|');
const sorts = {'best-selling-products': 'Most relevant', 'iphone-18-series': 'Best selling', 'iphone-17-series': 'Best selling', 'iphone-17-air': 'Most relevant', 'iphone-16-series': 'Best selling', 'phone-case': 'Best selling', 'watch-rolls-collection': 'Most relevant', all: 'Alphabetically, A-Z'};
data.collections.forEach(c => P(`| ${cell(c.title)} | \`${c.handle}\` | ${c.product_handles ? c.product_handles.length : '–'} | ${sorts[c.handle] || ''} | ${cell(c.description).slice(0, 160)} |`));
P('');
data.collections.filter(c => c.handle !== 'all' && c.product_handles && c.product_handles.length).forEach(c => {
  P(`**${c.title}** — order on the store:`);
  c.product_handles.forEach((h, i) => { const p = byHandle.get(h); P(`${i + 1}. ${p ? p.title : h}`); });
  P('');
});
P(`**Collection page:** title, product count, Sort (${th.collection_page.sort_options.length / 2 | 0} options: ${[...new Set(th.collection_page.sort_options.map(s => s.split(' = ')[1]))].join(', ')}), grid toggle (Default / Zoom out on desktop, Single / Default on phone).`);
P('');

P('## 6. Products');
P('');
P('| # | Product | Price | Variants (stock) | SKU | Collections | Images | Created |\n|---|---|---|---|---|---|---|---|');
data.products.forEach((p, i) => P(`| ${i + 1} | [${cell(p.title)}](${p.url}) | ${money(p.variants[0].price)} | ${p.variants.map(v => `${cell(v.title)} ${v.available ? '✓' : '✗ sold out'}`).join('<br>')} | ${p.variants.map(v => v.sku || '–').join('<br>')} | ${p.collections.join(', ')} | ${p.images.length} | ${p.created_at.slice(0, 10)} |`));
P('');
P('### Product descriptions and images');
P('');
data.products.forEach(p => {
  P(`#### ${p.title}`);
  P(`- URL: ${p.url}`);
  P(`- Type: ${p.product_type || '–'} · Vendor: ${p.vendor} · Tags: ${(p.tags || []).join(', ') || '–'}`);
  P(`- Options: ${p.options.map(o => `${o.name}: ${o.values.join(' / ')}`).join(' · ')}`);
  P(`- Variant ids: ${p.variants.map(v => `${v.title} = ${v.id}`).join(' · ')}`);
  P(`- Images: ${p.images.map(im => `[${im.position}](${im.src})`).join(' ')}`);
  if (p.description_text) P(`\n> ${p.description_text.split('\n').join('\n> ')}`);
  P('');
});

P('## 7. Product page layout');
P('');
P(`Reference: \`${th.product_page.example}\` (${th.product_page.gallery_images} images in the page).`);
P('');
th.product_page.blocks_in_order.forEach(b => P(`- ${cell(b)}`));
P('');
P('Sections on the product page:');
th.product_page.sections.forEach(s => P(`- \`${s.id}\`: ${cell(s.text).slice(0, 200)}`));
P('');

P('## 8. Footer');
P('');
P('- "Stay Connected" with an Instagram link: https://www.instagram.com/tailormadeint/');
P('- "Terms and Policies": Privacy policy, Refund policy, Terms of service.');
P('');

P('## 9. Pages');
P('');
(th.pages || []).forEach(pg => { P(`### ${pg.title} — ${pg.url}`); P(''); P(pg.text.split('\n').map(x => '> ' + x).join('\n')); P(''); });

P('## 10. Policies (full text)');
P('');
Object.values(th.policies || {}).forEach(po => { P(`### ${po.title}`); P(po.url); P(''); P(po.text); P(''); });

P('## 11. Sitemap');
P('');
Object.entries(th.sitemap || {}).forEach(([k, v]) => { P(`**${k}** (${v.length})`); v.forEach(u => P(`- ${u}`)); P(''); });

fs.writeFileSync(path.join(dir, 'STORE-DETAILS.md'), L.join('\n'));
console.log('wrote STORE-DETAILS.md', (fs.statSync(path.join(dir, 'STORE-DETAILS.md')).size / 1024).toFixed(0) + ' KB');
