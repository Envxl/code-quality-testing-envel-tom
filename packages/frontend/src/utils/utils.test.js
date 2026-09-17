import { formatDate, formatPrice, formatSearchTerm, formatStock, formatUserName } from './formatting'
import { validateEmail, validatePassword, validateProduct, validateUser } from './validation'

test('formatting utilities format values and safe fallbacks', () => {
  expect(formatDate('2020-01-02')).toBe('2/1/2020')
  expect(formatDate()).toBe('Invalid Date')
  expect(formatPrice(1234.5)).toBe('$1,234.50')
  expect(formatPrice('nope')).toBe('$0.00')
  expect(formatStock(0)).toBe('Out of Stock')
  expect(formatStock(3)).toBe('Low Stock (3 left)')
  expect(formatStock(8)).toBe('Limited Stock (8 available)')
  expect(formatStock(10)).toBe('In Stock (10)')
  expect(formatUserName('ada', 'lovelace')).toBe('Ada Lovelace')
  expect(formatUserName()).toBe('Unknown User')
  expect(formatSearchTerm('  hello   WORLD ')).toBe('Hello World')
})

test('validation utilities accept valid data and return field errors for invalid data', () => {
  expect(validateEmail('ada@example.com')).toBe(true)
  expect(validateEmail('invalid')).toBe(false)
  expect(validatePassword('Password1').isValid).toBe(true)
  expect(validatePassword('short').errors).toContain('Password must be at least 8 characters')
  expect(validateUser({ firstname: 'Ada', lastname: 'Lovelace', username: 'ada', password: 'Password1' }).isValid).toBe(true)
  expect(validateUser({}).errors).toMatchObject({ firstname: 'First name is required', username: 'Username is required' })
  expect(validateProduct({ name: 'Keyboard', price: 10, stock: 3 }).valid).toBe(true)
  expect(validateProduct({ name: '', price: -1, stock: -1 }).errors).toMatchObject({ name: 'Name is required', price: 'Price must be positive' })
})
