import axios from 'axios'
import { useCallback, useState } from 'react'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (config) => {
    const token = localStorage.getItem('token')

    try {
      setLoading(true)
      setError(null)

      const response = await axios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: token ? `Bearer ${token}` : undefined
        }
      })

      return response.data
    } catch (error_) {
      setError(error_.response?.data?.error || 'An error occurred')
      throw error_
    } finally {
      setLoading(false)
    }
  }, [])

  const get = (url) => request({ method: 'GET', url })
  const post = (url, data) => request({ data, method: 'POST', url })
  const put = (url, data) => request({ data, method: 'PUT', url })
  const del = (url) => request({ method: 'DELETE', url })

  return {
    delete: del,
    error,
    get,
    loading,
    post,
    put,
    request
  }
}
