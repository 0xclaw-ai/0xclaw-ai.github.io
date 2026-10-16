// Local-only static preview with byte-range support for seeking through videos.
import { createServer } from 'node:http';
import { createReadStream, realpathSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const root = realpathSync(resolve(import.meta.dirname, '..'));
const port = Number(process.env.PORT || 3042);
const mime = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }
  const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }

  let stat;
  try {
    stat = statSync(file);
    if (!stat.isFile()) throw new Error('Not a file');
    if (!realpathSync(file).startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
  } catch {
    response.writeHead(404).end();
    return;
  }

  const headers = {
    'Content-Type': mime[extname(file).toLowerCase()] || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '');
  let start = 0;
  let end = stat.size - 1;
  if (range) {
    if (!range[1] && range[2]) {
      start = Math.max(0, stat.size - Number(range[2]));
    } else {
      start = Number(range[1]);
      if (range[2]) end = Math.min(end, Number(range[2]));
    }
    if (start > end || start >= stat.size) {
      response.writeHead(416, { ...headers, 'Content-Range': `bytes */${stat.size}` }).end();
      return;
    }
    headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length'] = end - start + 1;
  response.writeHead(range ? 206 : 200, headers);
  if (request.method === 'HEAD') response.end();
  else createReadStream(file, { start, end }).pipe(response);
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`Local preview: http://127.0.0.1:${port}/\n`);
});
