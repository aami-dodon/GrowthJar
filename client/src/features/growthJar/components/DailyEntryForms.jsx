import { useState } from 'react'
import { useEntriesContext } from '../context/EntriesContext'
import { ENTRY_CATEGORIES } from '../utils/entryUtils'

const ParentOptions = ['Mom', 'Dad']

const DailyEntryForms = () => {
  const { addEntries } = useEntriesContext()
  const [parentAuthor, setParentAuthor] = useState(ParentOptions[0])
  const [parentGoodThing, setParentGoodThing] = useState('')
  const [parentGratitude, setParentGratitude] = useState('')
  const [childGratitudeDad, setChildGratitudeDad] = useState('')
  const [childGratitudeMom, setChildGratitudeMom] = useState('')
  const [parentFeedback, setParentFeedback] = useState('')
  const [childFeedback, setChildFeedback] = useState('')

  const resetParentForm = () => {
    setParentGoodThing('')
    setParentGratitude('')
  }

  const resetChildForm = () => {
    setChildGratitudeDad('')
    setChildGratitudeMom('')
  }

  const handleParentSubmit = (event) => {
    event.preventDefault()
    const entries = []
    if (parentGoodThing.trim()) {
      entries.push({
        category: ENTRY_CATEGORIES.PARENT_GOOD_THING,
        author: parentAuthor,
        target: 'Rishi',
        text: parentGoodThing.trim(),
      })
    }
    if (parentGratitude.trim()) {
      entries.push({
        category: ENTRY_CATEGORIES.PARENT_GRATITUDE,
        author: parentAuthor,
        target: 'Rishi',
        text: parentGratitude.trim(),
      })
    }

    if (!entries.length) {
      setParentFeedback('Add a note above before submitting.')
      return
    }

    addEntries(entries)
    setParentFeedback(`Beautiful! ${entries.length} slip${entries.length > 1 ? 's' : ''} were added to the jar.`)
    resetParentForm()
    setTimeout(() => setParentFeedback(''), 3500)
  }

  const handleChildSubmit = (event) => {
    event.preventDefault()
    const entries = []
    if (childGratitudeDad.trim()) {
      entries.push({
        category: ENTRY_CATEGORIES.CHILD_GRATITUDE_FATHER,
        author: 'Rishi',
        target: 'Dad',
        text: childGratitudeDad.trim(),
      })
    }
    if (childGratitudeMom.trim()) {
      entries.push({
        category: ENTRY_CATEGORIES.CHILD_GRATITUDE_MOTHER,
        author: 'Rishi',
        target: 'Mom',
        text: childGratitudeMom.trim(),
      })
    }

    if (!entries.length) {
      setChildFeedback('Rishi, share one thing you are grateful for!')
      return
    }

    addEntries(entries)
    setChildFeedback('Yay! Your gratitude notes are safely tucked into the jar.')
    resetChildForm()
    setTimeout(() => setChildFeedback(''), 3500)
  }

  return (
    <section id="daily-entries" className="space-y-10">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-3xl text-slate-900">Daily Gratitude Ritual</h2>
        <p className="max-w-3xl text-slate-600">
          Parents and Rishi each add one loving slip a day. These simple notes create a shared story of kindness, effort, and
          appreciation.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleParentSubmit}
          className="flex flex-col gap-6 rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-lg shadow-sky-100/50 backdrop-blur"
        >
          <header className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sky-600">
              <span aria-hidden="true">🧑‍🤝‍🧑</span> Parent reflection
            </span>
            <h3 className="font-display text-2xl text-slate-900">Celebrate Rishi's glow-up moments</h3>
          </header>
          <div className="grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
              Who is writing today?
              <div className="flex gap-3">
                {ParentOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setParentAuthor(option)}
                    className={
                      parentAuthor === option
                        ? 'flex-1 rounded-2xl border border-leaf-500 bg-leaf-100/70 px-4 py-2 font-semibold text-leaf-700 shadow-md'
                        : 'flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-500 transition hover:border-leaf-300 hover:text-leaf-600'
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
              Good thing Rishi did today
              <textarea
                value={parentGoodThing}
                onChange={(event) => setParentGoodThing(event.target.value)}
                rows={3}
                className="resize-none rounded-2xl border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-700 shadow-inner focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-200"
                placeholder="Rishi welcomed a new classmate at school..."
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
              Today we're grateful to Rishi for...
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
              className="rounded-full bg-gradient-to-r from-leaf-500 to-sky-500 px-5 py-2 font-semibold text-white shadow-lg shadow-leaf-300/40 transition hover:scale-[1.02]"
            >
              Drop slips into the jar
            </button>
          </div>
          {parentFeedback && (
            <p className="rounded-2xl bg-leaf-50 px-4 py-3 text-sm font-semibold text-leaf-700" role="status">
              {parentFeedback}
            </p>
          )}
        </form>

        <form
          onSubmit={handleChildSubmit}
          className="flex flex-col gap-6 rounded-3xl border border-sunshine-100 bg-white/80 p-6 shadow-lg shadow-sunshine-100/50 backdrop-blur"
        >
          <header className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sunshine-600">
              <span aria-hidden="true">🧒</span> Rishi's gratitude
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
              className="rounded-full bg-gradient-to-r from-sunshine-500 to-lavender-500 px-5 py-2 font-semibold text-white shadow-lg shadow-sunshine-300/40 transition hover:scale-[1.02]"
            >
              Send love to the jar
            </button>
          </div>
          {childFeedback && (
            <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700" role="status">
              {childFeedback}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}

export default DailyEntryForms
