import { useMemo, useState } from 'react'
import { useEntriesContext } from '../context/EntriesContext'
import { ENTRY_CATEGORIES, ENTRY_TYPES, formatDateLabel } from '../utils/entryUtils'
import StatusPill from './StatusPill'
import { appCopy } from '../../../shared/constants/appCopy'

const BetterChoiceSection = () => {
  const {
    addEntries,
    pendingBetterChoices,
    respondToBetterChoice,
    entries,
    currentUser,
    submissionPermissions,
  } = useEntriesContext()
  const [moment, setMoment] = useState('')
  const [desiredChoice, setDesiredChoice] = useState('')
  const [feedback, setFeedback] = useState('')
  const [responses, setResponses] = useState({})
  const [responseErrors, setResponseErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [respondingId, setRespondingId] = useState(null)

  const { canSubmitBetterChoices, canRespondToBetterChoices, parentAuthorLabel } = submissionPermissions
  const userRole = currentUser?.role ?? null

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmitBetterChoices) {
      setFeedback('Only Mom or Dad can add a better choice reflection.')
      return
    }
    if (isSubmitting) return
    if (!moment.trim() || !desiredChoice.trim()) {
      setFeedback('Share the moment and the better choice you want to practice together.')
      return
    }

    setIsSubmitting(true)
    try {
      await addEntries({
        category: ENTRY_CATEGORIES.BETTER_CHOICE,
        author: parentAuthorLabel,
        target: 'rishi',
        text: `It would have been more better if ${moment.trim()}.`,
        context: {
          desired: desiredChoice.trim(),
        },
      })
      setMoment('')
      setDesiredChoice('')
      setFeedback(`Thanks for guiding the moment with compassion. Invite ${appCopy.childName} to add their next-step plan!`)
      setTimeout(() => setFeedback(''), 4000)
    } catch (error) {
      setFeedback(error.message ?? 'We could not save this reflection. Please try again soon.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRespond = async (entryId) => {
    if (!canRespondToBetterChoices) {
      setResponseErrors((prev) => ({
        ...prev,
        [entryId]: `Only ${appCopy.childName} can close the loop on better choice reflections.`,
      }))
      return
    }
    const response = responses[entryId]?.trim()
    if (!response) return
    setRespondingId(entryId)
    setResponseErrors((prev) => {
      const next = { ...prev }
      delete next[entryId]
      return next
    })
    try {
      await respondToBetterChoice(entryId, `Next time, I could ${response}`)
      setResponses((prev) => ({ ...prev, [entryId]: '' }))
    } catch (error) {
      setResponseErrors((prev) => ({
        ...prev,
        [entryId]: error.message ?? 'Unable to add this promise right now. Please try again.',
      }))
    } finally {
      setRespondingId(null)
    }
  }

  const completedReflections = useMemo(
    () =>
      entries.filter((entry) => entry.meta?.type === ENTRY_TYPES.BETTER_CHOICE && entry.response).slice(0, 3),
    [entries],
  )

  const parentFallbackMessage =
    userRole === 'child'
      ? `Only Mom or Dad can add new better choice reflections. ${appCopy.childName}, your promises bloom on the right side.`
      : 'Your profile needs a parent role to add better choice reflections.'

  return (
    <section className="grid gap-8 rounded-3xl border border-lavender-100 bg-white/80 p-6 shadow-xl shadow-lavender-100/60 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl text-slate-900">Better Choice Coaching</h2>
            <p className="max-w-xl text-slate-600">
              When tricky moments happen, we add them to the same jar — because learning is part of growing. Keep the language gentle and loving.
            </p>
          </div>
          <span className="hidden lg:inline-flex">
            <StatusPill icon="🪄" variant="lavender">
              Reflect & Reset
            </StatusPill>
          </span>
        </div>
        {canSubmitBetterChoices ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
              <span>Writing as</span>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-lavender-400 bg-lavender-100/70 px-4 py-2 text-sm font-semibold text-lavender-700 shadow-sm">
                {parentAuthorLabel}
              </span>
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
              <span>Keep it specific and loving. {appCopy.childName} will add their plan below.</span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-gradient-to-r from-lavender-500 to-sky-500 px-5 py-2 font-semibold text-white shadow-lg shadow-lavender-300/40 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Saving…' : 'Add to the jar with care'}
              </button>
            </div>
            {feedback && (
              <p className="rounded-2xl bg-lavender-50 px-4 py-3 text-sm font-semibold text-lavender-700" role="status">
                {feedback}
              </p>
            )}
          </form>
        ) : (
          <div className="rounded-3xl border border-lavender-100 bg-white/70 px-5 py-6 text-sm font-semibold text-slate-600 shadow-inner">
            {parentFallbackMessage}
          </div>
        )}
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
            <h3 className="font-display text-2xl text-slate-900">{appCopy.childPossessiveName} gentle promise</h3>
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
                {canRespondToBetterChoices ? (
                  <>
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
                      disabled={respondingId === entry.id}
                      className="mt-3 w-full rounded-full bg-gradient-to-r from-sky-500 to-leaf-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200/40 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {respondingId === entry.id ? 'Saving…' : 'Add my better choice'}
                    </button>
                    {responseErrors[entry.id] && (
                      <p className="mt-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" role="status">
                        {responseErrors[entry.id]}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-slate-600">
                    Only {appCopy.childName} can add the promise that closes this reflection.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default BetterChoiceSection
