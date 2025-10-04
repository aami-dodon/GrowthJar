import dayjs from 'dayjs'
import { appCopy } from '../../../shared/constants/appCopy'

export const ENTRY_TYPES = {
  GOOD_THING: 'good-thing',
  GRATITUDE: 'gratitude',
  BETTER_CHOICE: 'better-choice',
}

export const ENTRY_CATEGORIES = {
  PARENT_GOOD_THING: 'parent-good-thing',
  PARENT_GRATITUDE: 'parent-gratitude',
  CHILD_GRATITUDE_FATHER: 'child-gratitude-father',
  CHILD_GRATITUDE_MOTHER: 'child-gratitude-mother',
  BETTER_CHOICE: 'better-choice',
}

export const entryMetadata = {
  [ENTRY_CATEGORIES.PARENT_GOOD_THING]: {
    type: ENTRY_TYPES.GOOD_THING,
    label: 'Good Thing',
    description: `Celebrating something wonderful ${appCopy.childName} did today.`,
    accent: 'from-sunshine-200 via-sunshine-300 to-sunshine-200',
    border: 'border-sunshine-400/70',
    text: 'text-slate-800',
    icon: '🌟',
  },
  [ENTRY_CATEGORIES.PARENT_GRATITUDE]: {
    type: ENTRY_TYPES.GRATITUDE,
    label: `Gratitude for ${appCopy.childName}`,
    description: `A thankful note from a parent to ${appCopy.childName}.`,
    accent: 'from-leaf-200 via-leaf-300 to-leaf-200',
    border: 'border-leaf-400/70',
    text: 'text-slate-800',
    icon: '💚',
  },
  [ENTRY_CATEGORIES.CHILD_GRATITUDE_FATHER]: {
    type: ENTRY_TYPES.GRATITUDE,
    label: `${appCopy.childName} → Dad`,
    description: `${appCopy.childName} shares gratitude for Dad.`,
    accent: 'from-sky-200 via-sky-300 to-sky-200',
    border: 'border-sky-400/70',
    text: 'text-slate-800',
    icon: '👨‍👦',
  },
  [ENTRY_CATEGORIES.CHILD_GRATITUDE_MOTHER]: {
    type: ENTRY_TYPES.GRATITUDE,
    label: `${appCopy.childName} → Mom`,
    description: `${appCopy.childName} shares gratitude for Mom.`,
    accent: 'from-lavender-200 via-lavender-300 to-lavender-200',
    border: 'border-lavender-400/70',
    text: 'text-slate-800',
    icon: '👩‍👦',
  },
  [ENTRY_CATEGORIES.BETTER_CHOICE]: {
    type: ENTRY_TYPES.BETTER_CHOICE,
    label: 'Better Choice',
    description: 'A gentle learning moment for the family to reflect on.',
    accent: 'from-blush-200 via-blush-300 to-blush-200',
    border: 'border-blush-400/70',
    text: 'text-slate-800',
    icon: '🪄',
  },
}

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const buildEntry = (entry) => {
  if (!entry.category) {
    throw new Error('Entry category is required to build an entry')
  }

  const meta = entryMetadata[entry.category] ?? null

  return {
    id: entry.id ?? generateId(),
    type: meta?.type ?? entry.type ?? ENTRY_TYPES.GOOD_THING,
    category: entry.category,
    author: entry.author,
    target: entry.target,
    text: entry.text,
    response: entry.response ?? null,
    context: entry.context ?? null,
    createdAt: entry.createdAt ? dayjs(entry.createdAt).toISOString() : dayjs().toISOString(),
    meta,
  }
}

export const filterEntriesByType = (entries, filter) => {
  if (filter === 'all') return entries
  return entries.filter((entry) => entry.meta?.type === filter)
}

export const computeEntryStats = (entries) => {
  const base = {
    total: entries.length,
    [ENTRY_TYPES.GOOD_THING]: 0,
    [ENTRY_TYPES.GRATITUDE]: 0,
    [ENTRY_TYPES.BETTER_CHOICE]: 0,
  }

  const gratitudeByVoice = {
    parents: 0,
    childToDad: 0,
    childToMom: 0,
  }

  const lastSevenDays = dayjs().subtract(6, 'day').startOf('day')
  const weeklyEntries = []

  entries.forEach((entry) => {
    const type = entry.meta?.type
    if (type && typeof base[type] === 'number') {
      base[type] += 1
    }

    if (entry.category === ENTRY_CATEGORIES.PARENT_GRATITUDE) {
      gratitudeByVoice.parents += 1
    }
    if (entry.category === ENTRY_CATEGORIES.CHILD_GRATITUDE_FATHER) {
      gratitudeByVoice.childToDad += 1
    }
    if (entry.category === ENTRY_CATEGORIES.CHILD_GRATITUDE_MOTHER) {
      gratitudeByVoice.childToMom += 1
    }

    if (dayjs(entry.createdAt).isSame(lastSevenDays, 'day') || dayjs(entry.createdAt).isAfter(lastSevenDays)) {
      weeklyEntries.push(entry)
    }
  })

  const timeline = Array.from({ length: 7 }).map((_, index) => {
    const day = dayjs().subtract(6 - index, 'day').startOf('day')
    const label = day.format('ddd')
    const items = entries.filter((entry) => dayjs(entry.createdAt).isSame(day, 'day'))
    return {
      label,
      date: day.format('YYYY-MM-DD'),
      count: items.length,
      entries: items,
    }
  })

  return {
    counts: base,
    gratitudeByVoice,
    weeklyEntries,
    timeline,
  }
}

export const formatDateLabel = (timestamp) => dayjs(timestamp).format('MMM D, YYYY')
export const formatTimeLabel = (timestamp) => dayjs(timestamp).format('h:mm A')

export const sortEntriesByDate = (entries) =>
  [...entries].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
