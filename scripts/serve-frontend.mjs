import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve('packages/frontend/build');
const port = 3000;
const mimeTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

http
  .createServer((request, response) => {
    const requestedPath = decodeURIComponent(request.url.split('?', 1)[0]);
    const relativePath = requestedPath === '/' ? '/index.html' : requestedPath;
    const filePath = path.resolve(root, `.${relativePath}`);
    const safePath = filePath.startsWith(root) ? filePath : path.join(root, 'index.html');

    fs.readFile(safePath, (error, data) => {
      if (error) {
        fs.readFile(path.join(root, 'index.html'), (fallbackError, fallbackData) => {
          if (fallbackError) {
            response.writeHead(500);
            response.end('Unable to serve the frontend');
            return;
          }
          response.writeHead(200, { 'Content-Type': 'text/html' });
          response.end(fallbackData);
        });
        return;
      }

      const extension = path.extname(safePath);
      response.writeHead(200, {
        'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
        'Content-Type': mimeTypes[extension] || 'application/octet-stream'
      });
      response.end(data);
    });
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Frontend server listening at http://localhost:${port}`);
  });
