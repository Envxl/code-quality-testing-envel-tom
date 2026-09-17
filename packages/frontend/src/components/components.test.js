import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import Navigation from './Navigation'
import LoadingSpinner from './LoadingSpinner'
import ErrorBoundary from './ErrorBoundary'
import { click, render } from '../testUtils'

jest.mock('../services/api', () => ({ logout: jest.fn() }))
const { logout } = require('../services/api')

afterEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

test('LoadingSpinner renders a visual loading indicator', () => {
  const view = render(<LoadingSpinner />)
  expect(view.container.querySelector('[style*="animation"]')).not.toBeNull()
  view.unmount()
})

test('Navigation shows user links and logs out', () => {
  localStorage.setItem('user', JSON.stringify({ firstname: 'Ada' }))
  const onLogout = jest.fn()
  const view = render(<MemoryRouter><Navigation onLogout={onLogout} /></MemoryRouter>)

  expect(view.container.textContent).toContain('Good')
  expect(view.container.textContent).toContain('Ada')
  expect(view.container.querySelector('a[href="/users"]')).not.toBeNull()
  click([...view.container.querySelectorAll('button')].find(button => button.textContent === 'Logout'))

  expect(logout).toHaveBeenCalledTimes(1)
  expect(onLogout).toHaveBeenCalledTimes(1)
  view.unmount()
})

test('ErrorBoundary displays a recovery view after a child error', () => {
  const originalError = console.error
  console.error = jest.fn()
  const Broken = () => { throw new Error('broken component') }
  const view = render(<ErrorBoundary><Broken /></ErrorBoundary>)

  expect(view.container.textContent).toContain('Something went wrong!')
  expect(view.container.textContent).toContain('broken component')
  console.error = originalError
  view.unmount()
})
