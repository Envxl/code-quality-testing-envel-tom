const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');

jest.mock('../db/database', () => ({ getDb: jest.fn() }));
const db = require('../db/database');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');

const request = (server, path, options = {}) => new Promise((resolve, reject) => {
  const body = options.body ? JSON.stringify(options.body) : undefined;
  const req = http.request({ port: server.address().port, path, method: options.method || 'GET', headers: { 'Content-Type': 'application/json', ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}), ...options.headers } }, res => {
    let responseBody = '';
    res.on('data', chunk => { responseBody += chunk; });
    res.on('end', () => resolve({ status: res.statusCode, body: responseBody ? JSON.parse(responseBody) : null }));
  });
  req.on('error', reject);
  if (body) req.write(body);
  req.end();
});

let server;
beforeAll(done => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', userRoutes);
  app.use('/api', productRoutes);
  server = app.listen(0, done);
});
afterAll(done => { server.close(done); });
afterEach(() => jest.clearAllMocks());

test('protected endpoints reject unauthenticated HTTP requests', async () => {
  await expect(request(server, '/api/products')).resolves.toMatchObject({ status: 401, body: { error: 'No token provided' } });
});

test('authenticated API endpoints execute controllers through the route stack', async () => {
  const token = jwt.sign({ id: 1 }, 'your-super-secret-key-that-should-not-be-hardcoded');
  db.getDb.mockReturnValue({
    all: jest.fn((sql, params, callback) => callback(null, [{ id: 1, name: 'Keyboard', price: 75, stock: 3 }])),
    get: jest.fn((sql, params, callback) => callback(null, sql.includes('COUNT') ? { total: 1 } : { avg: 75 })),
    run: jest.fn((sql, params, callback) => callback.call({ lastID: 9, changes: 1 }, null))
  });
  const headers = { Authorization: `Bearer ${token}` };
  await expect(request(server, '/api/products', { headers })).resolves.toMatchObject({ status: 200, body: { message: 'success', data: [expect.objectContaining({ name: 'Keyboard', cheaperCount: 1, avgPrice: 75 })] } });
  await expect(request(server, '/api/products', { method: 'POST', headers, body: { name: 'Mouse', price: 20, stock: 2 } })).resolves.toMatchObject({ status: 201, body: { id: 9, name: 'Mouse' } });
});
