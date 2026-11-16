// Tiny static server for previewing the showcase: node serve.js  ->  http://localhost:5178
// Also accepts POST /save?name=<file> (JSON or text body) to store snapshots into docs/ — local use only.
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.mp4': 'video/mp4', '.jpg': 'image/jpeg'};
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/save') {
    const name = (url.searchParams.get('name') || '').replace(/[^a-z0-9._-]/gi, '');
    if (!name) { res.writeHead(400); return res.end('missing name'); }
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const out = path.join(root, 'docs', name);
      fs.mkdirSync(path.dirname(out), {recursive: true});
      fs.writeFileSync(out, Buffer.concat(chunks));
      res.writeHead(200, {'Content-Type': 'text/plain'}); res.end('saved ' + name + ' ' + fs.statSync(out).size);
    });
    return;
  }
  // same addresses as on Netlify (see tools/build-deploy.sh)
  const route = decodeURIComponent(url.pathname).replace(/^\/shopify-preview\//, '/shopify/preview/').replace(/^\/showcase\//, '/');
  const p = path.join(root, route.replace(/\/$/, '/index.html'));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*'});
    res.end(data);
  });
}).listen(5178, '127.0.0.1', () => console.log('Showcase on http://localhost:5178'));
