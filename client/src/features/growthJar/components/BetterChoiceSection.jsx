import { useMemo, useState } from 'react'
import { useEntriesContext } from '../context/EntriesContext'
import { ENTRY_CATEGORIES, ENTRY_TYPES, formatDateLabel } from '../utils/entryUtils'
import StatusPill from './StatusPill'

const ParentChoices = ['Mom', 'Dad']

const BetterChoiceSection = () => {
  const { addEntries, pendingBetterChoices, respondToBetterChoice, entries } = useEntriesContext()
  const [author, setAuthor] = useState(ParentChoices[0])
  const [moment, setMoment] = useState('')
  const [desiredChoice, setDesiredChoice] = useState('')
  const [feedback, setFeedback] = useState('')
  const [responses, setResponses] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!moment.trim() || !desiredChoice.trim()) {
      setFeedback('Share the moment and the better choice you want to practice together.')
      return
    }

    addEntries({
      category: ENTRY_CATEGORIES.BETTER_CHOICE,
      author,
      target: 'Rishi',
      text: `It would have been more better if ${moment.trim()}.`,
      context: {
        desired: desiredChoice.trim(),
      },
    })
    setMoment('')
    setDesiredChoice('')
    setFeedback('Thanks for guiding the moment with compassion. Invite Rishi to add his next-step plan!')
    setTimeout(() => setFeedback(''), 4000)
  }

  const handleRespond = (entryId) => {
    const response = responses[entryId]?.trim()
    if (!response) return
    respondToBetterChoice(entryId, `Next time, I could ${response}`)
    setResponses((prev) => ({ ...prev, [entryId]: '' }))
  }

  const completedReflections = useMemo(
    () =>
      entries.filter((entry) => entry.meta?.type === ENTRY_TYPES.BETTER_CHOICE && entry.response).slice(0, 3),
    [entries],
  )

  return (
    <section className="grid gap-8 rounded-3xl border border-lavender-100 bg-white/80 p-6 shadow-xl shadow-lavender-100/60 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl text-slate-900">Better Choice Coaching</h2>
            <p className="max-w-xl text-slate-600">
              When tricky moments happen, we add them to the same jar — because learning is part of growing. Keep the language
              gentle and loving.
            </p>
          </div>
          <span className="hidden lg:inline-flex">
            <StatusPill icon="🪄" variant="lavender">
              Reflect & Reset
            </StatusPill>
          </span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {ParentChoices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setAuthor(choice)}
                className={
                  author === choice
                    ? 'rounded-full border border-lavender-500 bg-lavender-100/80 px-4 py-2 text-sm font-semibold text-lavender-700 shadow-md'
                    : 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-lavender-300 hover:text-lavender-600'
                }
              >
                {choice}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
            It would have been more better if...
            <textarea
              value={moment}
              onChange={(event) => setMoment(event.target.value)}
              rows={3}
              className="resize-none rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-700 shadow-inner focus:border-lavender-400 focus:outline-none focus:ring-2 focus:ring-lavender-200"
              placeholder="we had spoken kindly during the game."
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
            Next time, we hope to...
            <textarea
              value={desiredChoice}
              onChange={(event) => setDesiredChoice(event.target.value)}
              rows={3}
              className="resize-none rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-700 shadow-inner focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-200"
              placeholder="take a deep breath and share the toys with friends."
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>Keep it specific and loving. Rishi will add his plan below.</span>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-lavender-500 to-sky-500 px-5 py-2 font-semibold text-white shadow-lg shadow-lavender-300/40 transition hover:scale-[1.02]"
            >
              Add to the jar with care
            </button>
          </div>
          {feedback && (
            <p className="rounded-2xl bg-lavender-50 px-4 py-3 text-sm font-semibold text-lavender-700" role="status">
              {feedback}
            </p>
          )}
        </form>
        {completedReflections.length > 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white/70 p-4">
            <h3 className="font-semibold text-slate-700">Recent family follow-ups</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {completedReflections.map((entry) => (
                <li key={entry.id} className="rounded-2xl bg-slate-50/70 px-4 py-3">
                  <p className="font-semibold text-slate-700">{entry.text}</p>
                  {entry.context?.desired && (
                    <p className="text-xs text-slate-500">Family hope: {entry.context.desired}</p>
                  )}
                  <p className="mt-2 text-sm text-leaf-600">{entry.response}</p>
                  <span className="mt-1 block text-[11px] uppercase tracking-widest text-slate-400">
                    Reflected on {formatDateLabel(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-sky-50/60 p-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl text-slate-900">Rishi's gentle promise</h3>
            <p className="text-sm text-slate-600">Reply with “Next time, I could...” to close the loop with kindness.</p>
          </div>
          <StatusPill icon="⏳" variant="sky">
            {pendingBetterChoices.length} awaiting
          </StatusPill>
        </header>
        {pendingBetterChoices.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/80 px-6 py-10 text-center text-slate-500">
            <span className="text-4xl">🎉</span>
            <p>All caught up! Every learning moment has a hopeful plan.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {pendingBetterChoices.map((entry) => (
              <li key={entry.id} className="rounded-3xl border border-sky-100 bg-white/80 p-4 shadow-sm">
                <p className="font-semibold text-slate-700">{entry.text}</p>
                {entry.context?.desired && (
                  <p className="text-sm text-slate-500">Family hope: {entry.context.desired}</p>
                )}
                <label className="mt-3 flex flex-col gap-2 text-sm font-semibold text-slate-600">
                  My promise:
                  <textarea
                    value={responses[entry.id] ?? ''}
                    onChange={(event) =>
                      setResponses((prev) => ({
                        ...prev,
                        [entry.id]: event.target.value,
                      }))
                    }
                    rows={3}
                    className="resize-none rounded-2xl border-slate-200 bg-sky-50 px-4 py-3 text-base text-slate-700 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="take a deep breath and ask for help."
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRespond(entry.id)}
                  className="mt-3 w-full rounded-full bg-gradient-to-r from-sky-500 to-leaf-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200/40 transition hover:scale-[1.01]"
                >
                  Add my better choice
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default BetterChoiceSection
