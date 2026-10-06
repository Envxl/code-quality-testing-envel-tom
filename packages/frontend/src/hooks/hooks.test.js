import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import { useApi } from './useApi'
import { useAuth } from './useAuth'
import { click, flushPromises, render } from '../testUtils'

jest.mock('axios')

const ApiHarness = () => {
  const api = useApi()
  return <>
    <span>{api.loading ? 'loading' : 'idle'}</span><span>{api.error}</span>
    <button onClick={() => api.get('/users').catch(() => {})}>get</button>
    <button onClick={() => api.post('/users', { name: 'Ada' }).catch(() => {})}>post</button>
  </>
}

const AuthHarness = () => {
  const auth = useAuth()
  return <>
    <span>{auth.loading ? 'loading' : auth.user?.username || 'anonymous'}</span>
    <button onClick={() => auth.login('token', { username: 'ada' })}>login</button>
    <button onClick={auth.logout}>logout</button>
  </>
}

afterEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

test('useApi attaches the token and exposes request errors', async () => {
  localStorage.setItem('token', 'session')
  axios.mockResolvedValueOnce({ data: [{ id: 1 }] })
  const view = render(<ApiHarness />)
  click([...view.container.querySelectorAll('button')].find(button => button.textContent === 'get'))
  await flushPromises()
  expect(axios).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', url: '/users', headers: { Authorization: 'Bearer session' } }))

  axios.mockRejectedValueOnce({ response: { data: { error: 'Unavailable' } } })
  click([...view.container.querySelectorAll('button')].find(button => button.textContent === 'post'))
  await flushPromises()
  expect(view.container.textContent).toContain('Unavailable')
  view.unmount()
})

test('useAuth restores, saves, and clears a session', async () => {
  localStorage.setItem('token', 'existing')
  localStorage.setItem('user', JSON.stringify({ username: 'existing-user' }))
  const view = render(<MemoryRouter><AuthHarness /></MemoryRouter>)
  await flushPromises()
  expect(view.container.textContent).toContain('existing-user')
  click([...view.container.querySelectorAll('button')].find(button => button.textContent === 'login'))
  expect(localStorage.getItem('token')).toBe('token')
  expect(view.container.textContent).toContain('ada')
  click([...view.container.querySelectorAll('button')].find(button => button.textContent === 'logout'))
  expect(localStorage.getItem('token')).toBeNull()
  expect(view.container.textContent).toContain('anonymous')
  view.unmount()
})
