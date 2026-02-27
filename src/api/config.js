// API Configuration for frontend
// Automatically handles different environments: development, production, Vercel, etc.

const getAPIBaseURL = () => {
  // In development with Vite dev server, use relative URLs (proxied)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Local development - use relative URLs (Vite will proxy to :5000)
    return ''
  }

  // Check for environment variable from build process
  if (typeof import.meta !== 'undefined' && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // In Vercel or production with same domain, use relative URLs
  if (typeof window !== 'undefined') {
    // Use the same origin
    return ''
  }

  return 'http://localhost:5000'
}

// Get base URL for API calls
export const API_BASE_URL = getAPIBaseURL()

// Create axios-like fetch wrapper
export const fetchAPI = async (endpoint, options = {}) => {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Create axios-like instance for convenience
export const api = {
  get: (endpoint, options = {}) =>
    fetchAPI(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, data, options = {}) =>
    fetchAPI(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    }),

  put: (endpoint, data, options = {}) =>
    fetchAPI(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (endpoint, options = {}) =>
    fetchAPI(endpoint, { ...options, method: 'DELETE' })
}

export default api
