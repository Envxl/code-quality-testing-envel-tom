import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import AddProduct from './AddProduct'
import { change, flushPromises, render, submit } from '../testUtils'

jest.mock('../services/api', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  createProduct: jest.fn()
}))
const api = require('../services/api')

const field = (container, placeholder) => container.querySelector(`[placeholder="${placeholder}"]`)

afterEach(() => jest.clearAllMocks())

test('login submits credentials, invokes auth callback, and displays API failures', async () => {
  api.loginUser.mockResolvedValue({ token: 'token' })
  const onLogin = jest.fn()
  const view = render(<MemoryRouter><Login onLogin={onLogin} /></MemoryRouter>)
  change(field(view.container, 'Username'), 'ada')
  change(field(view.container, 'Password'), 'Password1')
  submit(view.container.querySelector('form'))
  await flushPromises()

  expect(api.loginUser).toHaveBeenCalledWith('ada', 'Password1')
  expect(onLogin).toHaveBeenCalledTimes(1)

  api.loginUser.mockRejectedValue({ error: 'Invalid credentials' })
  submit(view.container.querySelector('form'))
  await flushPromises()
  expect(view.container.textContent).toContain('Invalid credentials')
  view.unmount()
})

test('registration sends all entered values and reports server errors', async () => {
  api.registerUser.mockResolvedValue({ token: 'token' })
  const view = render(<MemoryRouter><Register /></MemoryRouter>)
  change(field(view.container, 'First Name'), 'Ada')
  change(field(view.container, 'Last Name'), 'Lovelace')
  change(field(view.container, 'Username'), 'ada')
  change(field(view.container, 'Password'), 'Password1')
  submit(view.container.querySelector('form'))
  await flushPromises()

  expect(api.registerUser).toHaveBeenCalledWith({ firstname: 'Ada', lastname: 'Lovelace', username: 'ada', password: 'Password1' })

  api.registerUser.mockRejectedValue({ response: { data: { error: 'Username already exists' } } })
  submit(view.container.querySelector('form'))
  await flushPromises()
  expect(view.container.textContent).toContain('Username already exists')
  view.unmount()
})

test('product form validates required fields and sends a valid product to the API', async () => {
  api.createProduct.mockResolvedValue({ id: 1 })
  const view = render(<MemoryRouter><AddProduct /></MemoryRouter>)
  submit(view.container.querySelector('form'))
  expect(view.container.textContent).toContain('All fields are required!')

  change(field(view.container, 'Product Name'), 'Keyboard')
  change(field(view.container, 'Price'), '75')
  change(field(view.container, 'Stock'), '10')
  submit(view.container.querySelector('form'))
  await flushPromises()
  expect(api.createProduct).toHaveBeenCalledWith({ name: 'Keyboard', price: '75', stock: '10' })
  view.unmount()
})
