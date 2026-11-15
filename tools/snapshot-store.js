// Takes a full snapshot of the public storefront data of tailormadeint.co into docs/store-data.json.
// Usage:  node tools/snapshot-store.js
// Uses only public storefront endpoints (products.json, collections.json, policy pages), slowly, with retries.
const fs = require('fs');
const path = require('path');
const STORE = 'https://www.tailormadeint.co';
const OUT = path.join(__dirname, '..', 'docs', 'store-data.json');
const wait = ms => new Promise(r => setTimeout(r, ms));

async function get(url, type = 'json', tries = 5){
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, {headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
        'Accept': type === 'json' ? 'application/json,text/plain,*/*' : 'text/html,application/xhtml+xml', 'Accept-Language': 'en'}});
      if (r.status === 429 || r.status >= 500) throw new Error('HTTP ' + r.status);
      if (!r.ok) return null;
      const out = type === 'json' ? await r.json() : await r.text();
      await wait(1200);
      return out;
    } catch (e) {
      const back = 2500 * (i + 1);
      console.warn(`  retry ${i + 1} for ${url} (${e.message}) in ${back}ms`);
      await wait(back);
    }
  }
  throw new Error('gave up on ' + url);
}
const text = html => (html || '').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();

(async () => {
  const snap = {fetched_at: new Date().toISOString(), store: STORE};

  console.log('collections…');
  const cols = (await get(`${STORE}/collections.json?limit=250`)).collections;
  snap.collections = [];
  for (const c of cols) {
    const list = await get(`${STORE}/collections/${c.handle}/products.json?limit=250`);
    snap.collections.push({handle: c.handle, title: c.title, description: text(c.body_html || c.description), published_at: c.published_at,
      image: c.image ? c.image.src : null, product_handles: (list ? list.products : []).map(p => p.handle)});
    console.log(`  ${c.handle}: ${list ? list.products.length : 0} products`);
  }
  const all = await get(`${STORE}/collections/all/products.json?limit=250`);
  snap.collections.unshift({handle: 'all', title: 'Products', description: '', product_handles: all.products.map(p => p.handle)});

  console.log('products…');
  snap.products = all.products.map(p => ({
    id: p.id, title: p.title, handle: p.handle, url: `${STORE}/products/${p.handle}`,
    vendor: p.vendor, product_type: p.product_type, tags: p.tags, created_at: p.created_at, published_at: p.published_at, updated_at: p.updated_at,
    description_text: text(p.body_html), description_html: p.body_html,
    options: (p.options || []).map(o => ({name: o.name, values: o.values})),
    variants: p.variants.map(v => ({id: v.id, title: v.title, sku: v.sku, price: v.price, compare_at_price: v.compare_at_price, available: v.available,
      option1: v.option1, option2: v.option2, option3: v.option3, grams: v.grams, requires_shipping: v.requires_shipping, taxable: v.taxable})),
    images: p.images.map(i => ({src: i.src, width: i.width, height: i.height, alt: i.alt || '', position: i.position}))
  }));
  for (const p of snap.products) p.collections = snap.collections.filter(c => c.handle !== 'all' && c.product_handles.includes(p.handle)).map(c => c.handle);

  console.log('policies…');
  snap.policies = {};
  for (const h of ['privacy-policy', 'refund-policy', 'terms-of-service', 'shipping-policy', 'contact-information', 'legal-notice']) {
    const html = await get(`${STORE}/policies/${h}`, 'html');
    if (!html) continue;
    const body = (html.match(/<div class="shopify-policy__body">([\s\S]*?)<\/div>\s*<\/div>/) || html.match(/<main[\s\S]*?<\/main>/) || [html])[1] || html;
    const title = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
    snap.policies[h] = {url: `${STORE}/policies/${h}`, title: text(title || h), text: text(body)};
    console.log(`  ${h}: ${snap.policies[h].text.length} chars`);
  }

  console.log('sitemap…');
  const sm = await get(`${STORE}/sitemap.xml`, 'html');
  const maps = sm ? [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]) : [];
  snap.sitemap = {};
  for (const m of maps) {
    const x = await get(m.replace(/&amp;/g, '&'), 'html');
    snap.sitemap[m.replace(/.*sitemap_|\.xml.*/g, '')] = x ? [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map(k => k[1].replace(/&amp;/g, '&')).filter(u => !/\/cdn\//.test(u)) : [];
  }

  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  fs.writeFileSync(OUT, JSON.stringify(snap, null, 2));
  console.log('saved', OUT, (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB', snap.products.length, 'products');
})().catch(e => { console.error(e); process.exit(1); });
