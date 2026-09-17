jest.mock('axios')
import axios from 'axios'
import { createProduct, getProducts, getUsers, loginUser, logout, registerUser } from './api'

afterEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

test('authentication API calls persist returned session data', async () => {
  axios.post.mockResolvedValueOnce({ data: { token: 'login-token', user: { username: 'ada' } } })
  await expect(loginUser('ada', 'Password1')).resolves.toEqual({ token: 'login-token', user: { username: 'ada' } })
  expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/auth/login', { username: 'ada', password: 'Password1' })
  expect(localStorage.getItem('token')).toBe('login-token')
  expect(JSON.parse(localStorage.getItem('user'))).toEqual({ username: 'ada' })

  axios.post.mockResolvedValueOnce({ data: { token: 'register-token' } })
  await registerUser({ username: 'new-user' })
  expect(axios.post).toHaveBeenLastCalledWith('http://localhost:3001/api/auth/register', { username: 'new-user' })
  expect(localStorage.getItem('token')).toBe('register-token')
})

test('protected API calls use the stored bearer token and product results are enriched', async () => {
  localStorage.setItem('token', 'session-token')
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, username: 'ada' }] })
  await expect(getUsers()).resolves.toEqual([{ id: 1, username: 'ada' }])
  expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/auth/users', { headers: { Authorization: 'Bearer session-token' } })

  axios.get.mockResolvedValueOnce({ data: { data: [{ id: 1, price: 20 }, { id: 2, price: 50 }] } })
  await expect(getProducts()).resolves.toEqual([
    { id: 1, price: 20, isCheapest: true, moreExpensiveCount: 1 },
    { id: 2, price: 50, isCheapest: false, moreExpensiveCount: 0 }
  ])

  axios.post.mockResolvedValueOnce({ data: { id: 3 } })
  await createProduct({ name: 'Keyboard' })
  expect(axios.post).toHaveBeenLastCalledWith('http://localhost:3001/api/products', { name: 'Keyboard' }, { headers: { Authorization: 'Bearer session-token' } })
})

test('failed login exposes the server error and logout clears the session', async () => {
  axios.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials' } } })
  await expect(loginUser('ada', 'wrong')).rejects.toEqual({ error: 'Invalid credentials' })
  localStorage.setItem('token', 'token')
  localStorage.setItem('user', '{}')
  logout()
  expect(localStorage.getItem('token')).toBeNull()
  expect(localStorage.getItem('user')).toBeNull()
})
