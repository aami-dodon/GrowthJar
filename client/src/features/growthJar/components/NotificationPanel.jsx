import { useState } from 'react'
import StatusPill from './StatusPill'

const initialSettings = {
  dailyReminder: true,
  weeklyReminder: true,
  entryAlerts: false,
  summaryEmail: true,
}

const NotificationPanel = () => {
  const [settings, setSettings] = useState(initialSettings)
  const [reflectionDay, setReflectionDay] = useState('Sunday evening')

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section className="flex h-full flex-col gap-5 rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-xl shadow-sky-100/60">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-slate-900">Gentle email reminders</h3>
          <p className="text-sm text-slate-600">
            Keep the habit fresh with encouraging nudges. Emails are positive, short, and personalized for your family.
          </p>
        </div>
        <StatusPill icon="✅" variant="sky">
          Email verified
        </StatusPill>
      </header>
      <ul className="space-y-3 text-sm text-slate-600">
        <li className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
          <div>
            <p className="font-semibold text-slate-800">Daily reminder</p>
            <p className="text-xs text-slate-500">“🌟 Time to add to the jar! What went well today?”</p>
          </div>
          <ToggleSwitch checked={settings.dailyReminder} onChange={() => toggleSetting('dailyReminder')} />
        </li>
        <li className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
          <div>
            <p className="font-semibold text-slate-800">Weekly reflection</p>
            <p className="text-xs text-slate-500">“📖 It’s family jar time — let’s open and celebrate!”</p>
          </div>
          <ToggleSwitch checked={settings.weeklyReminder} onChange={() => toggleSetting('weeklyReminder')} />
        </li>
        <li className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
          <div>
            <p className="font-semibold text-slate-800">Entry notifications</p>
            <p className="text-xs text-slate-500">Let each family member know when a new slip arrives.</p>
          </div>
          <ToggleSwitch checked={settings.entryAlerts} onChange={() => toggleSetting('entryAlerts')} />
        </li>
        <li className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
          <div>
            <p className="font-semibold text-slate-800">Weekly summary</p>
            <p className="text-xs text-slate-500">Receive an overview of wins, gratitude, and better choices.</p>
          </div>
          <ToggleSwitch checked={settings.summaryEmail} onChange={() => toggleSetting('summaryEmail')} />
        </li>
      </ul>
      <div className="rounded-3xl border border-slate-100 bg-slate-50/60 px-4 py-4 text-sm text-slate-600">
        <label className="flex flex-col gap-2">
          Preferred reflection time
          <select
            value={reflectionDay}
            onChange={(event) => setReflectionDay(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option>Sunday evening</option>
            <option>Friday bedtime</option>
            <option>Saturday morning</option>
            <option>Custom reminder (set in email)</option>
          </select>
        </label>
        <p className="mt-2 text-xs text-slate-500">We’ll send a cheerful reminder 1 hour before {reflectionDay.toLowerCase()}.</p>
      </div>
    </section>
  )
}

const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className="group relative inline-flex h-7 w-12 items-center justify-start rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-200 focus-visible:ring-offset-2"
    role="switch"
    aria-checked={checked}
  >
    <span
      aria-hidden="true"
      className={`absolute inset-0 rounded-full border transition-all duration-200 ${
        checked
          ? 'border-leaf-400 bg-leaf-400/90 shadow-[inset_0_0_0_1px_rgba(14,116,144,0.25)]'
          : 'border-slate-200 bg-slate-200/80 shadow-[inset_0_1px_3px_rgba(15,23,42,0.08)]'
      }`}
    />
    <span
      aria-hidden="true"
      className={`relative ml-1 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
    <span className="sr-only">Toggle setting</span>
  </button>
)

export default NotificationPanel
