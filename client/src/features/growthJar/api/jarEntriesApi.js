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

const authorizedRequest = async (endpoint, { method = 'GET', body, token } = {}) => {
  if (!token) {
    throw new Error('Authentication required')
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const config = {
    method,
    headers,
  }

  if (body && Object.keys(body).length > 0) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

export const fetchJarEntries = async ({ token, filter, familyId } = {}) => {
  const searchParams = new URLSearchParams()
  if (filter) {
    searchParams.set('filter', filter)
  }
  if (familyId) {
    searchParams.set('family_id', familyId)
  }

  const query = searchParams.toString()
  const endpoint = query ? `/jar-entries?${query}` : '/jar-entries'
  const data = await authorizedRequest(endpoint, { token })
  return data?.data ?? []
}

export const createJarEntry = async ({ token, payload }) => {
  const data = await authorizedRequest('/jar-entries', {
    method: 'POST',
    body: payload,
    token,
  })
  return data?.data
}

export const respondToJarEntry = async ({ token, entryId, content }) => {
  const data = await authorizedRequest(`/jar-entries/${entryId}/respond`, {
    method: 'POST',
    body: { content },
    token,
  })
  return data?.data
}

export const deleteJarEntry = async ({ token, entryId }) => {
  await authorizedRequest(`/jar-entries/${entryId}`, { method: 'DELETE', token })
}
