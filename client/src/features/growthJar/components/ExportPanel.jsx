import { useMemo } from 'react'
import { useEntriesContext } from '../context/EntriesContext'
import { exportEntriesToCsv, exportEntriesToPdf } from '../utils/exportUtils'
import { formatDateLabel } from '../utils/entryUtils'

const ExportPanel = () => {
  const { entries } = useEntriesContext()

  const latestEntry = useMemo(() => entries[0], [entries])

  return (
    <section className="flex h-full flex-col gap-4 rounded-3xl border border-sunshine-100 bg-white/80 p-6 shadow-xl shadow-sunshine-100/60">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-slate-900">Share the joy</h3>
          <p className="text-sm text-slate-600">Export your jar to print, scrapbook, or email to loved ones.</p>
        </div>
        <span className="rounded-full bg-sunshine-100 px-3 py-1 text-xs font-semibold text-sunshine-600">Keepsake ready</span>
      </header>
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-sunshine-50/70 to-white px-5 py-4 text-sm text-slate-600 shadow-inner">
        <p className="font-semibold text-slate-800">Latest slip</p>
        {latestEntry ? (
          <>
            <p className="mt-1 text-slate-600">{latestEntry.text}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Added {formatDateLabel(latestEntry.createdAt)} by {latestEntry.author}
            </p>
          </>
        ) : (
          <p>No slips yet — start capturing your moments!</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => exportEntriesToPdf(entries)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-sunshine-400 bg-gradient-to-r from-sunshine-400 to-lavender-400 px-4 py-3 font-semibold text-white shadow-lg shadow-sunshine-200/50 transition hover:scale-[1.01]"
        >
          <span aria-hidden="true">📄</span> Download PDF keepsake
        </button>
        <button
          type="button"
          onClick={() => exportEntriesToCsv(entries)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-600 shadow-lg shadow-slate-200/50 transition hover:border-sky-200 hover:text-sky-700"
        >
          <span aria-hidden="true">📊</span> Export as CSV
        </button>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-slate-50/60 px-5 py-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-700">Weekly celebration email</p>
        <p className="mt-1 text-xs text-slate-500">
          Send a recap of this week&apos;s slips to grandparents or caretakers. Attach the PDF and add a heartfelt note.
        </p>
        <button className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-leaf-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:scale-[1.02]">
          <span aria-hidden="true">✉️</span> Compose celebration email
        </button>
      </div>
    </section>
  )
}

export default ExportPanel
