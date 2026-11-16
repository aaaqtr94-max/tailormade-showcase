// Turns the store snapshot (docs/store-data.json) into a Shopify product import CSV, for a test store.
// Each product is tagged with its collections (e.g. "iphone-18-series"), so smart collections can be made from the tags.
// Stock: available variants get 10, sold-out variants get 0 (the real counts aren't public).
// usage: node tools/build-products-csv.js <out.csv>
const fs = require('fs'), path = require('path');
const data = require(path.join(__dirname, '..', 'docs', 'store-data.json'));
const out = process.argv[2] || path.join(__dirname, '..', 'TAILORMADE-products.csv');

const cols = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty',
  'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position', 'Image Alt Text', 'Status'];
const cell = v => { const s = v === null || v === undefined ? '' : String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const rows = [cols];

for (const p of data.products) {
  const opt = p.options[0] || {name: 'Title'};
  const single = p.variants.length === 1 && /default title/i.test(p.variants[0].title);
  const n = Math.max(p.variants.length, p.images.length);
  for (let i = 0; i < n; i++) {
    const v = p.variants[i], img = p.images[i], first = i === 0;
    const r = Object.fromEntries(cols.map(c => [c, '']));
    r.Handle = p.handle;
    if (first) {
      Object.assign(r, {Title: p.title, 'Body (HTML)': p.description_html || '', Vendor: p.vendor || 'Tailormade', Type: p.product_type || '',
        Tags: (p.collections || []).join(', '), Published: 'TRUE', 'Option1 Name': single ? 'Title' : opt.name, Status: 'active'});
    }
    if (v) Object.assign(r, {
      'Option1 Value': single ? 'Default Title' : v.option1, 'Variant SKU': v.sku || '', 'Variant Grams': v.grams || 0,
      'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': v.available ? 10 : 0, 'Variant Inventory Policy': 'deny',
      'Variant Fulfillment Service': 'manual', 'Variant Price': v.price, 'Variant Compare At Price': v.compare_at_price || '',
      'Variant Requires Shipping': v.requires_shipping ? 'TRUE' : 'FALSE', 'Variant Taxable': v.taxable ? 'TRUE' : 'FALSE'});
    if (img) Object.assign(r, {'Image Src': img.src, 'Image Position': img.position || i + 1, 'Image Alt Text': img.alt || p.title});
    rows.push(cols.map(c => r[c]));
  }
}
fs.writeFileSync(out, '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n');
console.log('wrote', out, '-', data.products.length, 'products,', rows.length - 1, 'rows');
