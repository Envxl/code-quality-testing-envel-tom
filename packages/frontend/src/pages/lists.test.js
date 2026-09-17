import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import ProductList from './ProductList'
import UserList from './UserList'
import { change, flushPromises, render } from '../testUtils'

jest.mock('../services/api', () => ({ getProducts: jest.fn(), getUsers: jest.fn() }))
const api = require('../services/api')

afterEach(() => jest.clearAllMocks())

test('ProductList renders mocked products and filters them by search, price, and stock', async () => {
  api.getProducts.mockResolvedValue([
    { id: 1, name: 'Keyboard', price: 25, stock: 4 },
    { id: 2, name: 'Monitor', price: 120, stock: 0 }
  ])
  const view = render(<MemoryRouter><ProductList /></MemoryRouter>)
  await flushPromises()
  expect(view.container.textContent).toContain('Keyboard')
  expect(view.container.textContent).toContain('Monitor')

  change(view.container.querySelector('[placeholder="Search products..."]'), 'keyboard')
  expect(view.container.textContent).toContain('Keyboard')
  expect(view.container.textContent).not.toContain('Monitor')
  view.unmount()
})

test('UserList renders users returned by the mocked API and supports search', async () => {
  api.getUsers.mockResolvedValue([
    { id: 1, firstname: 'Ada', lastname: 'Lovelace', username: 'ada', created_at: '2020-01-01' },
    { id: 2, firstname: 'Grace', lastname: 'Hopper', username: 'grace', created_at: '2020-01-02' }
  ])
  const view = render(<UserList />)
  await flushPromises()
  expect(view.container.textContent).toContain('Ada Lovelace')
  change(view.container.querySelector('[placeholder="Search users..."]'), 'ada')
  expect(view.container.textContent).toContain('Ada Lovelace')
  expect(view.container.textContent).not.toContain('Grace Hopper')
  view.unmount()
})

test('list pages show API errors', async () => {
  api.getProducts.mockRejectedValue(new Error('offline'))
  const products = render(<MemoryRouter><ProductList /></MemoryRouter>)
  await flushPromises()
  expect(products.container.textContent).toContain('Failed to load products')
  products.unmount()

  api.getUsers.mockRejectedValue(new Error('offline'))
  const users = render(<UserList />)
  await flushPromises()
  expect(users.container.textContent).toContain('Failed to load users')
  users.unmount()
})
