import { useMemo } from 'react'
import { useEntriesContext } from '../context/EntriesContext'
import { ENTRY_TYPES } from '../utils/entryUtils'
import { appCopy } from '../../../shared/constants/appCopy'

const WeeklyReflection = () => {
  const { stats, triggerCelebration } = useEntriesContext()
  const totalWeekly = stats.weeklyEntries.length

  const celebrationMessage = useMemo(() => {
    if (!totalWeekly) {
      return 'Start your first reflection night this weekend!'
    }
    if (totalWeekly < 5) {
      return 'A gentle week of growth. Celebrate the little things!'
    }
    return 'What a vibrant week — get ready for a confetti moment together!'
  }, [totalWeekly])

  return (
    <section
      id="weekly-reflection"
      className="rounded-3xl border border-leaf-100 bg-gradient-to-br from-white/90 via-leaf-50/80 to-sky-50/80 p-6 shadow-xl shadow-leaf-100/60"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-leaf-100/80 px-4 py-2 text-sm font-semibold text-leaf-700">
              <span aria-hidden="true">📖</span> Weekly reflection
            </span>
            <h2 className="font-display text-3xl text-slate-900">Open the jar together every Sunday</h2>
            <p className="max-w-2xl text-slate-600">
              Gather as a family to read the week&apos;s slips aloud. Celebrate strengths, thank one another, and cheer for better
              choices. Finish with a hug and a plan for the week ahead.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatBadge
              label="Good things"
              value={stats.counts[ENTRY_TYPES.GOOD_THING]}
              tone="sunshine"
              helper={`Moments ${appCopy.childName} shined`}
            />
            <StatBadge
              label="Gratitude notes"
              value={stats.counts[ENTRY_TYPES.GRATITUDE]}
              tone="leaf"
              helper={`Parents: ${stats.gratitudeByVoice.parents} • Dad: ${stats.gratitudeByVoice.rishiToDad} • Mom: ${stats.gratitudeByVoice.rishiToMom}`}
            />
            <StatBadge
              label="Better choices"
              value={stats.counts[ENTRY_TYPES.BETTER_CHOICE]}
              tone="lavender"
              helper="Moments of growth"
            />
          </div>
        </div>
        <div className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Weekly timeline</h3>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-600">{totalWeekly} slips</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            {stats.timeline.map((day) => (
              <li key={day.date} className="flex items-center gap-3">
                <span className="w-10 font-semibold text-slate-500">{day.label}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-leaf-400 via-sunshine-400 to-sky-400"
                    style={{ width: `${Math.min(100, day.count * 20)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-slate-400">{day.count}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{celebrationMessage}</p>
          <button
            type="button"
            onClick={triggerCelebration}
            className="rounded-full bg-gradient-to-r from-leaf-500 to-sunshine-500 px-5 py-3 font-semibold text-white shadow-lg shadow-leaf-300/50 transition hover:scale-[1.02]"
          >
            Launch weekly celebration
          </button>
        </div>
      </div>
    </section>
  )
}

const tones = {
  sunshine: 'from-sunshine-100 via-sunshine-200 to-sunshine-100 text-sunshine-700',
  leaf: 'from-leaf-100 via-leaf-200 to-leaf-100 text-leaf-700',
  lavender: 'from-lavender-100 via-lavender-200 to-lavender-100 text-lavender-700',
}

const StatBadge = ({ label, value, helper, tone }) => (
  <div className={`rounded-3xl border border-white/70 bg-gradient-to-br ${tones[tone]} px-4 py-5 shadow`}>
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
    <p className="font-display text-3xl">{value}</p>
    <p className="text-xs text-slate-600">{helper}</p>
  </div>
)

export default WeeklyReflection
