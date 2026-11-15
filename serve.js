// Tiny static server for previewing the showcase: node serve.js  ->  http://localhost:5178
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css'};
http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*'});
    res.end(data);
  });
}).listen(5178, () => console.log('Showcase on http://localhost:5178'));
