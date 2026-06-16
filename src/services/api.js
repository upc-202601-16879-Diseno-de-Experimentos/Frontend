import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://matchpoint-api-production-9e17.up.railway.app/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor to attach the token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('coachToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
