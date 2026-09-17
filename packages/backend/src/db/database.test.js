const mockClose = jest.fn();
const mockDatabase = jest.fn(function(path, callback) { this.close = mockClose; setImmediate(() => callback(null)); });
const mockInit = jest.fn(() => Promise.resolve());

jest.mock('sqlite3', () => ({ verbose: () => ({ Database: mockDatabase }) }));
jest.mock('./migrations/init', () => mockInit);

const database = require('./database');

afterEach(async () => {
  await database.closeConnection();
  jest.clearAllMocks();
});

test('connect initializes SQLite once, exposes it, and closes it', async () => {
  mockClose.mockImplementation(callback => callback(null));
  jest.spyOn(console, 'log').mockImplementation(() => {});
  const connection = await database.connect();
  expect(mockDatabase).toHaveBeenCalledTimes(1);
  expect(mockInit).toHaveBeenCalledWith(connection);
  expect(database.getDb()).toBe(connection);
  expect(await database.connect()).toBe(connection);
  await database.closeConnection();
  expect(mockClose).toHaveBeenCalledTimes(1);
  console.log.mockRestore();
});

test('getDb explains when callers have not connected', () => {
  expect(() => database.getDb()).toThrow('Database not connected');
});
