import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { login as loginRequest } from '../api/authApi'

const storageKey = import.meta.env.VITE_APP_STORAGE_KEY ?? 'gratitudeJar.auth'
const defaultState = { token: null, user: null, expiresIn: null }

const AuthContext = createContext(undefined)

const readStoredSession = () => {
  if (typeof window === 'undefined') {
    return defaultState
  }

  const raw = window.localStorage.getItem(storageKey)
  if (!raw) {
    return defaultState
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
      expiresIn: parsed.expiresIn ?? null,
    }
  } catch (error) {
    window.localStorage.removeItem(storageKey)
    return defaultState
  }
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(defaultState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (hydrated) return
    const initialState = readStoredSession()
    setAuthState(initialState)
    setHydrated(true)
  }, [hydrated])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    if (!authState?.token) {
      window.localStorage.removeItem(storageKey)
      return
    }
    window.localStorage.setItem(storageKey, JSON.stringify(authState))
  }, [authState, hydrated])

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    const session = {
      token: data.token,
      user: data.user,
      expiresIn: data.expiresIn ?? null,
    }
    setAuthState(session)
    return data.user
  }, [])

  const logout = useCallback(() => {
    setAuthState(defaultState)
  }, [])

  const value = useMemo(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState?.token),
      hydrated,
      login,
      logout,
    }),
    [authState, hydrated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
