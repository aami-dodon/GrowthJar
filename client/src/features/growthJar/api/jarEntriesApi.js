import { authorizedRequest } from '../../../lib/apiClient'

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
