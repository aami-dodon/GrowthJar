import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '../../auth/context/AuthContext'
import { createJarEntry, fetchJarEntries, respondToJarEntry } from '../api/jarEntriesApi'
import {
  buildEntry,
  computeEntryStats,
  filterEntriesByType,
  sortEntriesByDate,
  ENTRY_TYPES,
  ENTRY_CATEGORIES,
} from '../utils/entryUtils'
import { appCopy } from '../../../shared/constants/appCopy'

const EntriesContext = createContext(undefined)

const initialState = {
  entries: [],
  filter: 'all',
  showCelebration: false,
  lastAddedId: null,
  loading: false,
  error: null,
}

const entriesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }
    case 'SET_ENTRIES':
      return {
        ...state,
        entries: sortEntriesByDate(action.payload ?? []),
        lastAddedId: action.lastAddedId ?? null,
      }
    case 'ADD_ENTRIES': {
      const incoming = (Array.isArray(action.payload) ? action.payload : [action.payload]).map((entry) => buildEntry(entry))
      const entries = sortEntriesByDate([...state.entries, ...incoming])
      return {
        ...state,
        entries,
        lastAddedId: incoming.length ? incoming[0].id : state.lastAddedId,
      }
    }
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      }
    case 'RESPOND_TO_BETTER_CHOICE': {
      const { id, response, respondedAt } = action.payload
      const entries = state.entries.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              response,
              respondedAt: respondedAt ?? dayjs().toISOString(),
            }
          : entry,
      )
      return { ...state, entries }
    }
    case 'TRIGGER_CELEBRATION':
      return {
        ...state,
        showCelebration: true,
      }
    case 'DISMISS_CELEBRATION':
      return {
        ...state,
        showCelebration: false,
      }
    case 'RESET_LAST_ADDED':
      return {
        ...state,
        lastAddedId: null,
      }
    default:
      return state
  }
}

const canonicalRoleMap = new Map([
  ['mom', 'Mom'],
  ['mother', 'Mom'],
  ['dad', 'Dad'],
  ['father', 'Dad'],
  ['rishi', appCopy.childName],
])

const toDisplayName = (value) => {
  if (!value || typeof value !== 'string') return value ?? null
  const normalized = value.toLowerCase()
  return canonicalRoleMap.get(normalized) ?? value
}

const toCanonicalRole = (value) => {
  if (!value || typeof value !== 'string') return value ?? null
  const normalized = value.toLowerCase()
  if (['mom', 'mother'].includes(normalized)) return 'mom'
  if (['dad', 'father'].includes(normalized)) return 'dad'
  if (normalized === 'rishi') return 'rishi'
  return value
}

const inferCategory = (entryType, metadata) => {
  if (metadata?.category && Object.values(ENTRY_CATEGORIES).includes(metadata.category)) {
    return metadata.category
  }

  switch (entryType) {
    case 'good_thing':
      return ENTRY_CATEGORIES.PARENT_GOOD_THING
    case 'gratitude': {
      if (metadata?.target === 'father') return ENTRY_CATEGORIES.CHILD_GRATITUDE_FATHER
      if (metadata?.target === 'mother') return ENTRY_CATEGORIES.CHILD_GRATITUDE_MOTHER
      return ENTRY_CATEGORIES.PARENT_GRATITUDE
    }
    case 'better_choice':
    default:
      return ENTRY_CATEGORIES.BETTER_CHOICE
  }
}

const fallbackAuthorByCategory = (category) => {
  switch (category) {
    case ENTRY_CATEGORIES.PARENT_GOOD_THING:
    case ENTRY_CATEGORIES.PARENT_GRATITUDE:
    case ENTRY_CATEGORIES.BETTER_CHOICE:
      return 'Parent'
    case ENTRY_CATEGORIES.CHILD_GRATITUDE_FATHER:
    case ENTRY_CATEGORIES.CHILD_GRATITUDE_MOTHER:
      return appCopy.childName
    default:
      return 'Family'
  }
}

const normalizeJarEntries = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  const responses = new Map()
  const parents = []

  items.forEach((item) => {
    const metadata = item.metadata ?? {}
    if (metadata.responseTo) {
      responses.set(metadata.responseTo, {
        text: item.content,
        createdAt: item.createdAt,
        author: metadata.author ?? null,
      })
      return
    }
    parents.push(item)
  })

  return parents.map((item) => {
    const metadata = item.metadata ?? {}
    const category = inferCategory(item.entryType, metadata)

    const entry = buildEntry({
      id: item.id,
      category,
      author: toDisplayName(metadata.author ?? null) ?? fallbackAuthorByCategory(category),
      target: toDisplayName(metadata.target ?? null),
      text: item.content,
      context: metadata.context ?? null,
      createdAt: item.createdAt,
    })

    const response = responses.get(item.id)
    if (response) {
      return {
        ...entry,
        response: response.text,
        respondedAt: response.createdAt,
      }
    }

    return entry
  })
}

const mapEntryToApiPayload = (entry, user) => {
  if (!entry?.category || !entry?.text) {
    throw new Error('Entry must include category and text')
  }

  if (!user) {
    throw new Error('We could not verify who is adding this entry. Please sign in again.')
  }

  const normalizedUserRole = typeof user.role === 'string' ? user.role.toLowerCase() : null
  const normalizedFamilyRole = typeof user.familyRole === 'string' ? user.familyRole.toLowerCase() : null
  const normalizedEntryAuthor = toCanonicalRole(entry.author ?? null)

  const ensureParentAuthor = () => {
    if (normalizedUserRole !== 'parent') {
      throw new Error('Only parent accounts can add this entry.')
    }
    if (!['mom', 'dad'].includes(normalizedFamilyRole)) {
      throw new Error('Your account must be set up as Mom or Dad to add this entry.')
    }
    if (normalizedEntryAuthor && normalizedEntryAuthor !== normalizedFamilyRole) {
      throw new Error('You can only submit parent entries as yourself.')
    }
    return normalizedFamilyRole
  }

  const ensureChildAuthor = () => {
    if (normalizedUserRole !== 'child') {
      throw new Error(`Only ${appCopy.childName} can add this entry.`)
    }
    if (normalizedFamilyRole !== 'rishi') {
      throw new Error(`Only ${appCopy.childName} can add this entry.`)
    }
    if (normalizedEntryAuthor && normalizedEntryAuthor !== 'rishi') {
      throw new Error(`Only ${appCopy.childName} can add this entry.`)
    }
    return 'rishi'
  }

  switch (entry.category) {
    case ENTRY_CATEGORIES.PARENT_GOOD_THING: {
      const author = ensureParentAuthor()
      return {
        entryType: 'good_thing',
        content: entry.text,
        metadata: {
          category: entry.category,
          author,
          target: 'rishi',
        },
      }
    }
    case ENTRY_CATEGORIES.PARENT_GRATITUDE: {
      const author = ensureParentAuthor()
      return {
        entryType: 'gratitude',
        content: entry.text,
        metadata: {
          category: entry.category,
          author,
          target: 'rishi',
        },
      }
    }
    case ENTRY_CATEGORIES.CHILD_GRATITUDE_FATHER: {
      const author = ensureChildAuthor()
      return {
        entryType: 'gratitude',
        content: entry.text,
        metadata: {
          category: entry.category,
          author,
          target: 'father',
        },
      }
    }
    case ENTRY_CATEGORIES.CHILD_GRATITUDE_MOTHER: {
      const author = ensureChildAuthor()
      return {
        entryType: 'gratitude',
        content: entry.text,
        metadata: {
          category: entry.category,
          author,
          target: 'mother',
        },
      }
    }
    case ENTRY_CATEGORIES.BETTER_CHOICE: {
      const author = ensureParentAuthor()
      const metadata = {
        category: ENTRY_CATEGORIES.BETTER_CHOICE,
        author,
        target: 'rishi',
      }
      if (entry.context && Object.keys(entry.context).length > 0) {
        metadata.context = entry.context
      }
      return {
        entryType: 'better_choice',
        content: entry.text,
        metadata,
      }
    }
    default:
      throw new Error('Unsupported entry category')
  }
}

export const EntriesProvider = ({ children }) => {
  const { token, user } = useAuth()
  const [state, dispatch] = useReducer(entriesReducer, initialState)

  const normalizedUserRole = typeof user?.role === 'string' ? user.role.toLowerCase() : null
  const normalizedFamilyRole = typeof user?.familyRole === 'string' ? user.familyRole.toLowerCase() : null

  const parentAuthorLabel = useMemo(() => {
    if (normalizedUserRole !== 'parent') return null
    if (normalizedFamilyRole === 'mom') return 'Mom'
    if (normalizedFamilyRole === 'dad') return 'Dad'
    return null
  }, [normalizedFamilyRole, normalizedUserRole])

  const childAuthorLabel = useMemo(() => {
    if (normalizedUserRole !== 'child') return null
    if (normalizedFamilyRole === 'rishi') return appCopy.childName
    return null
  }, [normalizedFamilyRole, normalizedUserRole])

  const submissionPermissions = useMemo(
    () => ({
      canSubmitParentEntries: Boolean(parentAuthorLabel),
      canSubmitChildEntries: Boolean(childAuthorLabel),
      canSubmitBetterChoices: Boolean(parentAuthorLabel),
      canRespondToBetterChoices: Boolean(childAuthorLabel),
      parentAuthorLabel,
      childAuthorLabel,
    }),
    [childAuthorLabel, parentAuthorLabel],
  )

  const loadEntries = useCallback(async () => {
    if (!token) {
      dispatch({ type: 'SET_ENTRIES', payload: [], lastAddedId: null })
      dispatch({ type: 'SET_ERROR', payload: null })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const items = await fetchJarEntries({ token })
      const normalized = normalizeJarEntries(items)
      dispatch({ type: 'SET_ENTRIES', payload: normalized, lastAddedId: null })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message ?? 'Failed to load jar entries' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [token])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const addEntries = useCallback((payload) => {
    if (!token) {
      return Promise.reject(new Error('Authentication required'))
    }
    if (!user) {
      return Promise.reject(new Error('We could not verify your profile. Please sign in again.'))
    }
    if (!payload) return Promise.resolve([])

    const entries = Array.isArray(payload) ? payload : [payload]

    return entries.reduce(async (accPromise, current) => {
      const acc = await accPromise
      const apiPayload = mapEntryToApiPayload(current, user)
      const created = await createJarEntry({ token, payload: apiPayload })
      const [normalized] = normalizeJarEntries([created])
      if (normalized) {
        dispatch({ type: 'ADD_ENTRIES', payload: normalized })
        acc.push(normalized)
      }
      return acc
    }, Promise.resolve([]))
  }, [token, user])

  const respondToBetterChoice = useCallback((id, response) => {
    if (!token) {
      return Promise.reject(new Error('Authentication required'))
    }
    if (!id || !response) return Promise.resolve(null)

    return respondToJarEntry({ token, entryId: id, content: response }).then((created) => {
      dispatch({
        type: 'RESPOND_TO_BETTER_CHOICE',
        payload: { id, response, respondedAt: created?.createdAt ?? dayjs().toISOString() },
      })
      return created
    })
  }, [token])

  const setFilter = useCallback((filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter })
  }, [])

  const triggerCelebration = useCallback(() => {
    dispatch({ type: 'TRIGGER_CELEBRATION' })
    setTimeout(() => dispatch({ type: 'DISMISS_CELEBRATION' }), 2200)
  }, [])

  const dismissCelebration = useCallback(() => {
    dispatch({ type: 'DISMISS_CELEBRATION' })
  }, [])

  const resetLastAdded = useCallback(() => {
    dispatch({ type: 'RESET_LAST_ADDED' })
  }, [])

  const filteredEntries = useMemo(
    () => filterEntriesByType(state.entries, state.filter),
    [state.entries, state.filter],
  )

  const pendingBetterChoices = useMemo(
    () =>
      state.entries
        .filter((entry) => entry.category === ENTRY_CATEGORIES.BETTER_CHOICE && !entry.response)
        .sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()),
    [state.entries],
  )

  const stats = useMemo(() => computeEntryStats(state.entries), [state.entries])

  const value = useMemo(
    () => ({
      entries: state.entries,
      filteredEntries,
      filter: state.filter,
      addEntries,
      respondToBetterChoice,
      setFilter,
      triggerCelebration,
      dismissCelebration,
      resetLastAdded,
      showCelebration: state.showCelebration,
      lastAddedId: state.lastAddedId,
      pendingBetterChoices,
      stats,
      ENTRY_TYPES,
      loading: state.loading,
      error: state.error,
      refresh: loadEntries,
      currentUser: user,
      submissionPermissions,
    }),
    [
      state.entries,
      filteredEntries,
      state.filter,
      addEntries,
      respondToBetterChoice,
      setFilter,
      triggerCelebration,
      dismissCelebration,
      resetLastAdded,
      state.showCelebration,
      state.lastAddedId,
      pendingBetterChoices,
      stats,
      state.loading,
      state.error,
      loadEntries,
      user,
      submissionPermissions,
    ],
  )

  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>
}

export const useEntriesContext = () => {
  const context = useContext(EntriesContext)
  if (!context) {
    throw new Error('useEntriesContext must be used within EntriesProvider')
  }
  return context
}
