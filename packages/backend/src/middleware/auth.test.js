const jwt = require('jsonwebtoken');
const auth = require('./auth');

const response = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

test('rejects requests without a token', () => {
  const res = response();
  auth({ headers: {} }, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
});

test('accepts a valid bearer token and attaches its payload', () => {
  const token = jwt.sign({ id: 7, username: 'ada' }, 'your-super-secret-key-that-should-not-be-hardcoded');
  const req = { headers: { authorization: `Bearer ${token}` } };
  const next = jest.fn();
  auth(req, response(), next);
  expect(req.user).toMatchObject({ id: 7, username: 'ada' });
  expect(next).toHaveBeenCalledTimes(1);
});

test('rejects invalid bearer tokens', () => {
  const res = response();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  auth({ headers: { authorization: 'Bearer invalid' } }, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Failed to authenticate token' });
  console.error.mockRestore();
});
