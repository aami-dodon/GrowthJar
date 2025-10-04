import clsx from 'clsx'
import { useMemo } from 'react'
import { useEntriesContext } from '../context/EntriesContext'
import { ENTRY_TYPES, formatDateLabel, formatTimeLabel } from '../utils/entryUtils'
import GrowthJarVisual from './GrowthJarVisual'

const filterOptions = [
  { value: 'all', label: 'All slips', emoji: '🥰' },
  { value: ENTRY_TYPES.GOOD_THING, label: 'Good things', emoji: '🌟' },
  { value: ENTRY_TYPES.GRATITUDE, label: 'Gratitude notes', emoji: '💚' },
  { value: ENTRY_TYPES.BETTER_CHOICE, label: 'Better choices', emoji: '🪄' },
]

const JarShowcase = () => {
  const { entries, filteredEntries, filter, setFilter, lastAddedId, resetLastAdded, loading, error } = useEntriesContext()

  const recentEntries = useMemo(() => filteredEntries.slice(0, 6), [filteredEntries])

  return (
    <section className="grid gap-8 rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-2xl shadow-sky-100/60 backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
      <div className="flex flex-col items-center gap-6">
        <div className="flex w-full items-center justify-between">
          <div>
            <h2 className="font-display text-3xl text-slate-900">Your shared Growth Jar</h2>
            <p className="text-sm text-slate-600">Every slip — joyful or reflective — lives here together.</p>
          </div>
          <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">{entries.length} slips</span>
        </div>
        <GrowthJarVisual entries={filteredEntries} highlightId={lastAddedId} />
        {lastAddedId && (
          <button
            type="button"
            onClick={resetLastAdded}
            className="text-xs font-semibold text-sky-600 underline-offset-2 hover:underline"
          >
            Dismiss highlight
          </button>
        )}
      </div>

      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                filter === option.value
                  ? 'border-sky-400 bg-sky-100/80 text-sky-800 shadow-md shadow-sky-100'
                  : 'border-slate-200 bg-white/70 text-slate-500 hover:border-sky-200 hover:text-sky-700',
              )}
            >
              <span>{option.emoji}</span>
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-hidden rounded-3xl border border-slate-100 bg-white/80">
          {error && !loading && (
            <div className="mx-4 mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="status">
              {error}
            </div>
          )}
          <ul className="h-full space-y-3 overflow-y-auto px-4 py-4 pr-3 text-sm text-slate-600">
            {loading ? (
              <li className="flex h-40 flex-col items-center justify-center gap-3 text-slate-400">
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" aria-hidden="true" />
                <span>Loading jar entries…</span>
              </li>
            ) : recentEntries.length === 0 ? (
              <li className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
                <span className="text-4xl">😊</span>
                <p>Nothing here yet. Add a slip to see it glow inside the jar!</p>
              </li>
            ) : (
              recentEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-3xl border border-slate-100 bg-gradient-to-r from-white via-sky-50/60 to-white px-4 py-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">
                        <span className="mr-2 text-lg">{entry.meta?.icon}</span>
                        {entry.meta?.label}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{entry.text}</p>
                      {entry.context?.desired && (
                        <p className="mt-1 text-xs text-slate-500">Family hope: {entry.context.desired}</p>
                      )}
                      {entry.response && <p className="mt-2 text-sm text-leaf-600">{entry.response}</p>}
                    </div>
                    <div className="text-right text-xs font-semibold uppercase tracking-widest text-slate-400">
                      <span className="block">{formatDateLabel(entry.createdAt)}</span>
                      <span>{formatTimeLabel(entry.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    By {entry.author} {entry.target && <span className="text-slate-400">→ {entry.target}</span>}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default JarShowcase
