const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:7500/api'

const handleResponse = async (response) => {
  let payload
  try {
    payload = await response.json()
  } catch (error) {
    payload = null
  }

  if (!response.ok) {
    const error = new Error(payload?.message ?? 'Something went wrong')
    error.status = response.status
    error.details = payload?.details
    throw error
  }

  return payload
}

const request = async (endpoint, { method = 'GET', body, headers } = {}) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && Object.keys(body).length > 0) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

export const signup = async (payload) => {
  const data = await request('/auth/signup', { method: 'POST', body: payload })
  return data?.data
}

export const login = async (payload) => {
  const data = await request('/auth/login', { method: 'POST', body: payload })
  return data?.data
}

export const verifyEmail = async (token) =>
  request('/auth/verify-email', { method: 'POST', body: { token } })

export const requestPasswordReset = async (email) =>
  request('/auth/request-password-reset', { method: 'POST', body: { email } })

export const resetPassword = async ({ token, newPassword }) =>
  request('/auth/reset-password', { method: 'POST', body: { token, newPassword } })
