// Phone preview on the home Wi-Fi, without publishing anything:  node preview-phone.js
// Read-only: serves only the site page and its video, nothing else in the folder. Stop it with Ctrl+C.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const root = __dirname, PORT = 5179;
const types = {'.html': 'text/html; charset=utf-8', '.mp4': 'video/mp4', '.jpg': 'image/jpeg'};
const allowed = p => p === '/site/index.html' || /^\/demos\/[\w-]+\.html$/.test(p) || /^\/assets\/video\/[\w.-]+\.(mp4|jpg)$/.test(p);
http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/' || p === '/site' || p === '/site/') p = '/site/index.html';
  if (!allowed(p)) { res.writeHead(404); return res.end('Not found'); }
  const file = path.join(root, p);
  fs.stat(file, (err, st) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const type = types[path.extname(file)] || 'application/octet-stream';
    const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range); // phones stream video in ranges
    if (range) {
      const start = range[1] ? +range[1] : 0, end = range[2] ? Math.min(+range[2], st.size - 1) : st.size - 1;
      res.writeHead(206, {'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-store'});
      return fs.createReadStream(file, {start, end}).pipe(res);
    }
    res.writeHead(200, {'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store'});
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
  console.log('Phone preview (same Wi-Fi):'); ips.forEach(ip => console.log(`  http://${ip}:${PORT}/site/`));
});
