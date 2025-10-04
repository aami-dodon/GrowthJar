import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import dayjs from 'dayjs'
import { initialEntries } from '../data/initialEntries'
import {
  buildEntry,
  computeEntryStats,
  filterEntriesByType,
  sortEntriesByDate,
  ENTRY_TYPES,
  ENTRY_CATEGORIES,
} from '../utils/entryUtils'

const EntriesContext = createContext(undefined)

const initialState = {
  entries: sortEntriesByDate(initialEntries),
  filter: 'all',
  showCelebration: false,
  lastAddedId: null,
}

const entriesReducer = (state, action) => {
  switch (action.type) {
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
      const { id, response } = action.payload
      const entries = state.entries.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              response,
              respondedAt: dayjs().toISOString(),
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

export const EntriesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(entriesReducer, initialState)

  const addEntries = useCallback((payload) => {
    if (!payload) return
    dispatch({ type: 'ADD_ENTRIES', payload })
  }, [])

  const respondToBetterChoice = useCallback((id, response) => {
    if (!id || !response) return
    dispatch({ type: 'RESPOND_TO_BETTER_CHOICE', payload: { id, response } })
  }, [])

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
