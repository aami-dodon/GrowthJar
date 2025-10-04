import clsx from 'clsx'
import { useMemo } from 'react'
import { ENTRY_TYPES } from '../utils/entryUtils'

const typeStyles = {
  [ENTRY_TYPES.GOOD_THING]: {
    base: 'from-sunshine-100 via-sunshine-200 to-sunshine-100 border-sunshine-400/60',
    shadow: 'shadow-[0_10px_25px_rgba(246,156,0,0.25)]',
  },
  [ENTRY_TYPES.GRATITUDE]: {
    base: 'from-leaf-100 via-leaf-200 to-leaf-100 border-leaf-400/60',
    shadow: 'shadow-[0_10px_25px_rgba(56,179,106,0.2)]',
  },
  [ENTRY_TYPES.BETTER_CHOICE]: {
    base: 'from-lavender-100 via-lavender-200 to-lavender-100 border-lavender-400/60',
    shadow: 'shadow-[0_10px_25px_rgba(130,87,245,0.25)]',
  },
}

const MAX_SLIPS = 24

const GrowthJarVisual = ({ entries, highlightId, className = '' }) => {
  const slips = useMemo(() => {
    const display = entries.slice(0, MAX_SLIPS)
    return display.map((entry, index) => {
      const columnCount = 4
      const column = index % columnCount
      const row = Math.floor(index / columnCount)
      const left = 6 + column * 22 + (row % 2 === 0 ? 3 : -3)
      const bottom = 16 + row * 36
      return {
        entry,
        style: {
          left: `${left}%`,
          bottom: `${bottom}px`,
          zIndex: row + 1,
        },
        isHighlight: entry.id === highlightId,
      }
    })
  }, [entries, highlightId])

  return (
    <div className={clsx('relative flex w-full max-w-sm items-end justify-center', className)} aria-hidden="true">
      <div className="absolute -top-14 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-100/80 to-white/30 blur-3xl" />
      <div className="relative h-[420px] w-[260px] rounded-t-[120px] border-4 border-sky-200/80 bg-white/80 px-4 pb-8 pt-12 shadow-jar backdrop-blur">
        <div className="absolute -top-[18px] left-1/2 h-6 w-44 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-200 to-sky-100 shadow-inner" />
        <div className="absolute inset-x-6 bottom-6 top-16 rounded-b-[90px] border-[3px] border-white/60 bg-gradient-to-b from-white/70 via-sky-50/80 to-leaf-50/60" />
        <div className="absolute inset-x-10 bottom-10 top-20 overflow-hidden rounded-b-[80px]">
          <div className="absolute inset-x-0 bottom-0 top-12 rounded-b-[80px] bg-gradient-to-t from-white/70 via-white/40 to-transparent" />
          {slips.map(({ entry, style, isHighlight }) => {
            const visuals = typeStyles[entry.meta?.type] ?? typeStyles[ENTRY_TYPES.GOOD_THING]
            return (
              <div
                key={entry.id}
                style={style}
                className={clsx(
                  'absolute w-[72px] rounded-xl border bg-gradient-to-br px-2 py-3 text-[0.7rem] font-semibold text-slate-700 shadow-lg transition-transform duration-500 ease-out',
                  visuals.base,
                  visuals.shadow,
                  isHighlight && 'animate-slipDrop scale-105',
                )}
              >
                <span className="block text-xs">{entry.meta?.icon}</span>
              </div>
            )
          })}
        </div>
        <div className="absolute inset-x-12 top-8 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Filled with love</span>
          <span>{entries.length} slips</span>
        </div>
        <div className="absolute inset-x-12 bottom-2 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <span>Gratitude</span>
          <span>Growth</span>
        </div>
      </div>
      <div className="absolute -right-6 bottom-32 hidden flex-col gap-2 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold text-slate-600 shadow-xl backdrop-blur sm:flex">
        <div className="flex items-center gap-2 text-leaf-600">
          <span className="text-base">💚</span>
          <span>Thankful hearts</span>
        </div>
        <div className="flex items-center gap-2 text-sunshine-600">
          <span className="text-base">🌟</span>
          <span>Daily wins</span>
        </div>
        <div className="flex items-center gap-2 text-lavender-600">
          <span className="text-base">🪄</span>
          <span>Better choices</span>
        </div>
      </div>
    </div>
  )
}

export default GrowthJarVisual
