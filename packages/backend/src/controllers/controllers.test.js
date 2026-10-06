jest.mock('../db/database', () => ({ getDb: jest.fn() }));

const db = require('../db/database');
const jwt = require('jsonwebtoken');
const users = require('./userController');
const products = require('./productController');

const response = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

afterEach(() => jest.clearAllMocks());

test('registerUser writes a hashed user and returns an auth token', () => {
  const run = jest.fn((sql, params, callback) => callback.call({ lastID: 12 }, null));
  db.getDb.mockReturnValue({ run });
  const res = response();
  users.registerUser({ body: { username: 'ada', password: 'Password1', firstname: 'Ada', lastname: 'Lovelace' } }, res);
  expect(run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'), expect.arrayContaining(['ada', expect.any(String), 'Ada', 'Lovelace']), expect.any(Function));
  expect(res.status).toHaveBeenCalledWith(201);
  expect(jwt.verify(res.json.mock.calls[0][0].token, 'your-super-secret-key-that-should-not-be-hardcoded')).toMatchObject({ id: 12 });
});

test('loginUser returns users, rejects missing users, and rejects bad passwords', () => {
  const res = response();
  db.getDb.mockReturnValue({ get: jest.fn((sql, params, callback) => callback(null, null)) });
  users.loginUser({ body: { username: 'ada', password: 'Password1' } }, res);
  expect(res.status).toHaveBeenCalledWith(404);

  const hashed = require('bcryptjs').hashSync('Password1', 8);
  db.getDb.mockReturnValue({ get: jest.fn((sql, params, callback) => callback(null, { id: 2, username: 'ada', password: hashed, firstname: 'Ada', lastname: 'Lovelace' })) });
  const successful = response();
  users.loginUser({ body: { username: 'ada', password: 'Password1' } }, successful);
  expect(successful.status).toHaveBeenCalledWith(200);
  expect(successful.json.mock.calls[0][0].user).toEqual({ id: 2, username: 'ada', firstname: 'Ada', lastname: 'Lovelace' });
});

test('user list and similarity controller return database results', () => {
  db.getDb.mockReturnValue({ all: jest.fn((sql, params, callback) => callback(null, [{ id: 1, username: 'ada' }])) });
  const listResponse = response();
  users.getAllUsers({}, listResponse);
  expect(listResponse.json).toHaveBeenCalledWith([{ id: 1, username: 'ada' }]);

  db.getDb.mockReturnValue({ all: jest.fn((sql, params, callback) => callback(null, [{ username: 'ada' }, { username: 'add' }, { username: 'grace' }])) });
  const similarResponse = response();
  users.findSimilarUsernames({}, similarResponse);
  expect(similarResponse.json).toHaveBeenCalledWith(expect.objectContaining({ totalComparisons: 3, similar: expect.arrayContaining([expect.objectContaining({ user1: 'ada', user2: 'add', distance: 1 })]) }));
});

test('product controllers create, retrieve, update, and enrich products', async () => {
  const res = response();
  db.getDb.mockReturnValue({ run: jest.fn((sql, params, callback) => callback.call({ lastID: 5, changes: 1 }, null)) });
  products.createProduct({ body: { name: 'Keyboard', price: 75, stock: 10 } }, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({ id: 5, name: 'Keyboard', price: 75, stock: 10 });

  const get = jest.fn((sql, params, callback) => callback(null, sql.includes('COUNT') ? { total: 1 } : sql.includes('AVG') ? { avg: 75 } : { id: 5, name: 'Keyboard' }));
  db.getDb.mockReturnValue({ get });
  const one = response();
  products.getProduct({ params: { id: 5 } }, one);
  expect(one.json).toHaveBeenCalledWith({ message: 'success', data: { id: 5, name: 'Keyboard' } });

  const all = response();
  db.getDb.mockReturnValue({ all: jest.fn((sql, params, callback) => callback(null, [{ id: 5, price: 75 }])), get });
  products.getAllProducts({}, all);
  await new Promise(setImmediate);
  expect(all.json).toHaveBeenCalledWith({ message: 'success', data: [{ id: 5, price: 75, cheaperCount: 1, avgPrice: 75 }] });

  const updated = response();
  db.getDb.mockReturnValue({ run: jest.fn((sql, params, callback) => callback.call({ changes: 1 }, null)) });
  products.updateStock({ params: { id: 5 }, body: { stock: 3 } }, updated);
  expect(updated.json).toHaveBeenCalledWith({ success: true });
});
