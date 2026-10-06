const axios = jest.fn()

axios.get = jest.fn()
axios.post = jest.fn()
axios.put = jest.fn()
axios.delete = jest.fn()

export default axios
