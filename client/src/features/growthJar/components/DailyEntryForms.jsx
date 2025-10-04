import { useState } from 'react'
import { useEntriesContext } from '../context/EntriesContext'
import { ENTRY_CATEGORIES } from '../utils/entryUtils'
import { appCopy } from '../../../shared/constants/appCopy'

const DailyEntryForms = () => {
  const { addEntries, submissionPermissions } = useEntriesContext()
  const [parentGoodThing, setParentGoodThing] = useState('')
  const [parentGratitude, setParentGratitude] = useState('')
  const [childGratitudeDad, setChildGratitudeDad] = useState('')
  const [childGratitudeMom, setChildGratitudeMom] = useState('')
  const [parentAlert, setParentAlert] = useState(null)
  const [childAlert, setChildAlert] = useState(null)
  const [isParentSubmitting, setIsParentSubmitting] = useState(false)
  const [isChildSubmitting, setIsChildSubmitting] = useState(false)

  const { canSubmitParentEntries, canSubmitChildEntries, parentAuthorLabel, childAuthorLabel } = submissionPermissions

  const resetParentForm = () => {
    setParentGoodThing('')
    setParentGratitude('')
  }

  const resetChildForm = () => {
    setChildGratitudeDad('')
    setChildGratitudeMom('')
  }

  const handleParentSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmitParentEntries) {
      setParentAlert({ type: 'error', message: 'Your account can only submit your own parent notes.' })
      return
    }
    if (isParentSubmitting) return
    const entries = []
    if (parentGoodThing.trim()) {
      entries.push({
        category: ENTRY_CATEGORIES.PARENT_GOOD_THING,
        author: parentAuthorLabel,
        target: 'rishi',
        text: parentGoodThing.trim(),
      })
    }
    if (parentGratitude.trim()) {
      entries.push({
        category: ENTRY_CATEGORIES.PARENT_GRATITUDE,
        author: parentAuthorLabel,
        target: 'rishi',
        text: parentGratitude.trim(),
      })
    }

    if (!entries.length) {
      setParentAlert({ type: 'error', message: 'Add a note above before submitting.' })
      return
    }

    setIsParentSubmitting(true)
    try {
      await addEntries(entries)
      setParentAlert({
        type: 'success',
        message: `Beautiful! ${entries.length} slip${entries.length > 1 ? 's' : ''} were added to the jar.`,
      })
      resetParentForm()
      setTimeout(() => setParentAlert(null), 3500)
    } catch (error) {
      setParentAlert({
        type: 'error',
        message: error.message ?? 'We could not add your slips right now. Please try again in a moment.',
      })
    } finally {
      setIsParentSubmitting(false)
    }
  }

  const handleChildSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmitChildEntries) {
      setChildAlert({ type: 'error', message: `Only ${appCopy.childName} can add these gratitude notes.` })
      return
    }
    if (isChildSubmitting) return
    const entries = []
    if (childGratitudeDad.trim()) {
      entries.push({
        category: ENTRY_CATEGORIES.CHILD_GRATITUDE_FATHER,
        author: childAuthorLabel ?? appCopy.childName,
        target: 'Dad',
        text: childGratitudeDad.trim(),
      })
    }
    if (childGratitudeMom.trim()) {
      entries.push({
        category: ENTRY_CATEGORIES.CHILD_GRATITUDE_MOTHER,
        author: childAuthorLabel ?? appCopy.childName,
        target: 'Mom',
        text: childGratitudeMom.trim(),
      })
    }

    if (!entries.length) {
      setChildAlert({ type: 'error', message: `${appCopy.childName}, share one thing you are grateful for!` })
      return
    }

    setIsChildSubmitting(true)
    try {
      await addEntries(entries)
      setChildAlert({ type: 'success', message: 'Yay! Your gratitude notes are safely tucked into the jar.' })
      resetChildForm()
      setTimeout(() => setChildAlert(null), 3500)
    } catch (error) {
      setChildAlert({
        type: 'error',
        message: error.message ?? 'Hmm, the jar could not save your gratitude just yet. Try again soon.',
      })
    } finally {
      setIsChildSubmitting(false)
    }
  }

  return (
    <section id="daily-entries" className="space-y-10">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-3xl text-slate-900">Daily Gratitude Ritual</h2>
        <p className="max-w-3xl text-slate-600">
          Parents and {appCopy.childName} each add one loving slip a day. These simple notes create a shared story of kindness,
          effort, and appreciation.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {canSubmitParentEntries && (
          <form
            onSubmit={handleParentSubmit}
            className="flex flex-col gap-6 rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-lg shadow-sky-100/50 backdrop-blur"
          >
            <header className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sky-600">
                <span aria-hidden="true">🧑‍🤝‍🧑</span> Parent reflection
              </span>
              <h3 className="font-display text-2xl text-slate-900">Celebrate {appCopy.childPossessiveName} glow-up moments</h3>
            </header>
            <div className="grid gap-4">
              <div className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
                <span>Writing as</span>
                <span className="inline-flex w-fit items-center gap-2 rounded-2xl border border-leaf-400 bg-leaf-100/80 px-4 py-2 text-base font-semibold text-leaf-700 shadow-sm">
                  {parentAuthorLabel}
                </span>
              </div>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                Good thing {appCopy.childName} did today
                <textarea
                  value={parentGoodThing}
                  onChange={(event) => setParentGoodThing(event.target.value)}
                  rows={3}
                  className="resize-none rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-700 shadow-inner focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-200"
                  placeholder={`${appCopy.childName} welcomed a new classmate at school...`}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                Today we&rsquo;re grateful to {appCopy.childName} for...
                <textarea
                  value={parentGratitude}
                  onChange={(event) => setParentGratitude(event.target.value)}
                  rows={3}
                  className="resize-none rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-700 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Thank you for helping tidy up the living room..."
                />
              </label>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">Add at least one note a day to keep the jar buzzing with love.</p>
              <button
                type="submit"
                disabled={isParentSubmitting}
                className="rounded-full bg-gradient-to-r from-leaf-500 to-sky-500 px-5 py-2 font-semibold text-white shadow-lg shadow-leaf-300/40 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isParentSubmitting ? 'Saving…' : 'Drop slips into the jar'}
              </button>
            </div>
            {parentAlert && (
              <p
                className={
                  parentAlert.type === 'error'
                    ? 'rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700'
                    : 'rounded-2xl bg-leaf-50 px-4 py-3 text-sm font-semibold text-leaf-700'
                }
                role="status"
              >
                {parentAlert.message}
              </p>
            )}
          </form>
        )}

        {canSubmitChildEntries && (
          <form
            onSubmit={handleChildSubmit}
            className="flex flex-col gap-6 rounded-3xl border border-sunshine-100 bg-white/80 p-6 shadow-lg shadow-sunshine-100/50 backdrop-blur"
          >
            <header className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sunshine-600">
                <span aria-hidden="true">🧒</span> {appCopy.childPossessiveName} gratitude
              </span>
              <h3 className="font-display text-2xl text-slate-900">Thank you, Mom and Dad!</h3>
            </header>
            <div className="grid gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                I am grateful to Dad for...
                <textarea
                  value={childGratitudeDad}
                  onChange={(event) => setChildGratitudeDad(event.target.value)}
                  rows={3}
                  className="resize-none rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-700 shadow-inner focus:border-sunshine-400 focus:outline-none focus:ring-2 focus:ring-sunshine-200"
                  placeholder="Reading me my favorite adventure story..."
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                I am grateful to Mom for...
                <textarea
                  value={childGratitudeMom}
                  onChange={(event) => setChildGratitudeMom(event.target.value)}
                  rows={3}
                  className="resize-none rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-700 shadow-inner focus:border-lavender-400 focus:outline-none focus:ring-2 focus:ring-lavender-200"
                  placeholder="Packing a surprise note in my lunch..."
                />
              </label>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">Kind words water our family garden. Share one every night!</p>
              <button
                type="submit"
                disabled={isChildSubmitting}
                className="rounded-full bg-gradient-to-r from-sunshine-500 to-lavender-500 px-5 py-2 font-semibold text-white shadow-lg shadow-sunshine-300/40 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChildSubmitting ? 'Saving…' : 'Send love to the jar'}
              </button>
            </div>
            {childAlert && (
              <p
                className={
                  childAlert.type === 'error'
                    ? 'rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700'
                    : 'rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700'
                }
                role="status"
              >
                {childAlert.message}
              </p>
            )}
          </form>
        )}

        {!canSubmitParentEntries && !canSubmitChildEntries && (
          <div className="rounded-3xl border border-slate-100 bg-white/80 px-6 py-8 text-sm font-semibold text-slate-600 shadow-inner">
            Sign in as Mom, Dad, or {appCopy.childName} to add new gratitude slips.
          </div>
        )}
      </div>
    </section>
  )
}

export default DailyEntryForms
