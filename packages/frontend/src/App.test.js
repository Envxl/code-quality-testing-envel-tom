import React from 'react'
import App from './App'
import { render } from './testUtils'

jest.mock('./components/Navigation', () => () => <nav>Navigation</nav>)
jest.mock('./pages/Login', () => () => <h1>Login page</h1>)
jest.mock('./pages/Register', () => () => <h1>Register page</h1>)
jest.mock('./pages/UserList', () => () => <h1>Users page</h1>)
jest.mock('./pages/ProductList', () => () => <h1>Products page</h1>)
jest.mock('./pages/AddProduct', () => () => <h1>Add product page</h1>)

afterEach(() => localStorage.clear())

test('authentication flow redirects guests to login and authenticated users to products', () => {
  window.history.pushState({}, '', '/')
  const guest = render(<App />)
  expect(guest.container.textContent).toContain('Login page')
  expect(guest.container.textContent).not.toContain('Navigation')
  guest.unmount()

  localStorage.setItem('token', 'session')
  window.history.pushState({}, '', '/')
  const authenticated = render(<App />)
  expect(authenticated.container.textContent).toContain('Products page')
  expect(authenticated.container.textContent).toContain('Navigation')
  authenticated.unmount()
})
