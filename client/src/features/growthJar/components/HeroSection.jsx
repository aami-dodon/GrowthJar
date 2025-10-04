import { useMemo } from 'react'
import { useEntriesContext } from '../context/EntriesContext'
import { ENTRY_TYPES } from '../utils/entryUtils'
import GrowthJarVisual from './GrowthJarVisual'

const HeroSection = () => {
  const { entries, stats, lastAddedId } = useEntriesContext()

  const highlightId = useMemo(() => lastAddedId, [lastAddedId])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-leaf-50 pb-20 pt-16">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-100/40 to-transparent" aria-hidden="true" />
      <div className="absolute left-12 top-12 h-24 w-24 rounded-full bg-sunshine-200/50 blur-3xl" aria-hidden="true" />
      <div className="absolute right-10 bottom-10 hidden h-40 w-40 rounded-full bg-lavender-200/40 blur-3xl lg:block" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:items-stretch lg:px-8">
        <div className="max-w-xl space-y-6 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-glow backdrop-blur">
            <span className="text-base">✨</span> One jar. Endless family moments.
          </span>
          <h1 className="font-display text-4xl leading-tight text-slate-900 sm:text-5xl">
            Rishi&rsquo;s <span className="text-sky-600">Growth Jar</span>
          </h1>
          <p className="text-lg text-slate-600 sm:text-xl">
            A shared space where Rishi and parents celebrate wins, practice gratitude, and learn from better choices. Build a
            heartwarming ritual that grows kinder every day.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-left lg:justify-start">
            <a
              href="#daily-entries"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-leaf-400 to-sky-400 px-6 py-3 font-semibold text-white shadow-lg shadow-leaf-300/40 transition hover:scale-[1.02] hover:shadow-glow"
            >
              Start today&rsquo;s slips <span className="transition group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#weekly-reflection"
              className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-5 py-3 font-semibold text-sky-700 shadow-md backdrop-blur transition hover:border-sky-300 hover:text-sky-900"
            >
              Plan reflection night
            </a>
          </div>
          <dl className="grid gap-4 rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur lg:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-slate-400">Good things</dt>
              <dd className="font-display text-3xl text-sunshine-600">{stats.counts[ENTRY_TYPES.GOOD_THING]}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-slate-400">Gratitude notes</dt>
              <dd className="font-display text-3xl text-leaf-600">{stats.counts[ENTRY_TYPES.GRATITUDE]}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-slate-400">Better choices</dt>
              <dd className="font-display text-3xl text-lavender-600">{stats.counts[ENTRY_TYPES.BETTER_CHOICE]}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-1 items-center justify-center pb-6">
          <GrowthJarVisual entries={entries} highlightId={highlightId} />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
