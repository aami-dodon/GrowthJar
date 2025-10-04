import { authorizedRequest } from '../../../lib/apiClient'

export const fetchNotificationPreferences = async ({ token } = {}) => {
  const data = await authorizedRequest('/notification-preferences', { token })
  return data?.data ?? null
}

export const updateNotificationPreferences = async ({ token, payload }) => {
  const data = await authorizedRequest('/notification-preferences', {
    method: 'PUT',
    body: payload,
    token,
  })
  return data?.data ?? null
}
