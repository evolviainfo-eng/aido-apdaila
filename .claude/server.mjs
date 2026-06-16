import http from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const PORT = 3007;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.xml':  'application/xml',
};

http.createServer(async (req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/' || url === '') url = '/index.html';
  const filePath = join(root, url);
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    try {
      const data = await readFile(join(root, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  }
}).listen(PORT, () => console.log(`Aido Apdaila → http://localhost:${PORT}`));
