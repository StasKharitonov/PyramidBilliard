import axios from 'axios'

// Base URL of the Django API. Override with VITE_API_URL in a .env file.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const ACCESS_TOKEN_KEY = 'billiard_access'
const REFRESH_TOKEN_KEY = 'billiard_refresh'

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

// AuthContext registers a handler so we can force a logout when the refresh
// token is no longer valid.
let onLogout = () => {}
export const setLogoutHandler = (fn) => {
  onLogout = fn
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT access token to every request.
client.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On a 401, try refreshing the access token once, then retry the request.
let refreshPromise = null
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    if (status === 401 && original && !original._retry && tokenStore.getRefresh()) {
      original._retry = true
      try {
        refreshPromise =
          refreshPromise ||
          axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: tokenStore.getRefresh(),
          })
        const { data } = await refreshPromise
        refreshPromise = null
        tokenStore.set(data.access, null)
        original.headers.Authorization = `Bearer ${data.access}`
        return client(original)
      } catch (refreshError) {
        refreshPromise = null
        tokenStore.clear()
        onLogout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Turn a DRF error response into a readable message for the UI.
export function extractError(error, fallback = 'Что-то пошло не так. Попробуйте ещё раз.') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (typeof data === 'string') return data
  if (data.detail) return data.detail

  const parts = []
  for (const [key, value] of Object.entries(data)) {
    let text
    if (Array.isArray(value)) text = value.join(' ')
    else if (typeof value === 'object' && value !== null) text = JSON.stringify(value)
    else text = String(value)
    parts.push(key === 'non_field_errors' ? text : `${key}: ${text}`)
  }
  return parts.join('\n') || fallback
}

export default client
