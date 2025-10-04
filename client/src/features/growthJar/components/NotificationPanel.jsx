import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../../auth/context/AuthContext'
import { fetchNotificationPreferences, updateNotificationPreferences } from '../api/notificationPreferencesApi'
import StatusPill from './StatusPill'

const defaultSettings = {
  dailyReminder: true,
  weeklyReminder: true,
  entryAlerts: true,
  summaryEmail: true,
  preferredReflectionTime: 'Sunday evening',
}

const normalizeSettings = (preferences) => ({
  dailyReminder:
    typeof preferences?.dailyReminder === 'boolean' ? preferences.dailyReminder : defaultSettings.dailyReminder,
  weeklyReminder:
    typeof preferences?.weeklyReminder === 'boolean' ? preferences.weeklyReminder : defaultSettings.weeklyReminder,
  entryAlerts:
    typeof preferences?.entryAlerts === 'boolean' ? preferences.entryAlerts : defaultSettings.entryAlerts,
  summaryEmail:
    typeof preferences?.summaryEmail === 'boolean' ? preferences.summaryEmail : defaultSettings.summaryEmail,
  preferredReflectionTime:
    typeof preferences?.preferredReflectionTime === 'string' && preferences.preferredReflectionTime.trim().length > 0
      ? preferences.preferredReflectionTime
      : defaultSettings.preferredReflectionTime,
})

const NotificationPanel = () => {
  const { token, hydrated } = useAuth()
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return

    if (!token) {
      setSettings(defaultSettings)
      setLoading(false)
      setError(null)
      return
    }

    let active = true

    const loadPreferences = async () => {
      setLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const response = await fetchNotificationPreferences({ token })
        if (!active) return
        setSettings(normalizeSettings(response))
      } catch (err) {
        if (!active) return
        setError(err.message ?? 'We could not load your notification preferences.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPreferences()

    return () => {
      active = false
    }
  }, [hydrated, token])

  const persistPreferences = useCallback(
    async (nextSettings, previousSettings) => {
      if (!isMountedRef.current) {
        return
      }

      if (!token) {
        setError('Please sign in to manage your notification preferences.')
        if (previousSettings) {
          setSettings(previousSettings)
        }
        return
      }

      setSaving(true)
      setError(null)
      setSuccess(null)

      try {
        const saved = await updateNotificationPreferences({ token, payload: nextSettings })
        if (!isMountedRef.current) return
        setSettings(normalizeSettings(saved))
        setSuccess('Preferences saved.')
      } catch (err) {
        if (!isMountedRef.current) return
        setError(err.message ?? 'We could not save your notification preferences.')
        if (previousSettings) {
          setSettings(previousSettings)
        }
      } finally {
        if (isMountedRef.current) {
          setSaving(false)
        }
      }
    },
    [token],
  )

  useEffect(() => {
    if (!success) return
    const timeout = setTimeout(() => {
      setSuccess(null)
    }, 4000)

    return () => {
      clearTimeout(timeout)
    }
  }, [success])

  const handleToggle = useCallback(
    (key) => {
      setSettings((prev) => {
        const previous = { ...prev }
        const next = { ...prev, [key]: !prev[key] }
        persistPreferences(next, previous)
        return next
      })
    },
    [persistPreferences],
  )

  const handleReflectionChange = useCallback(
    (value) => {
      setSettings((prev) => {
        const previous = { ...prev }
        const next = { ...prev, preferredReflectionTime: value }
        persistPreferences(next, previous)
        return next
      })
    },
    [persistPreferences],
  )

  const isBusy = loading || saving
  const reflectionCopy = settings.preferredReflectionTime ?? defaultSettings.preferredReflectionTime

  return (
    <section className="flex h-full flex-col gap-5 rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-xl shadow-sky-100/60">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-slate-900">Gentle email reminders</h3>
          <p className="text-sm text-slate-600">
            Keep the habit fresh with encouraging nudges. Emails are positive, short, and personalized for your family, and all
            notifications arrive right in your inbox.
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
          <ToggleSwitch checked={settings.dailyReminder} disabled={isBusy} onChange={() => handleToggle('dailyReminder')} />
        </li>
        <li className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
          <div>
            <p className="font-semibold text-slate-800">Weekly reflection</p>
            <p className="text-xs text-slate-500">“📖 It’s family jar time — let’s open and celebrate!”</p>
          </div>
          <ToggleSwitch checked={settings.weeklyReminder} disabled={isBusy} onChange={() => handleToggle('weeklyReminder')} />
        </li>
        <li className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
          <div>
            <p className="font-semibold text-slate-800">Entry notifications</p>
            <p className="text-xs text-slate-500">Let each family member know via email when a new slip arrives.</p>
          </div>
          <ToggleSwitch checked={settings.entryAlerts} disabled={isBusy} onChange={() => handleToggle('entryAlerts')} />
        </li>
        <li className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
          <div>
            <p className="font-semibold text-slate-800">Weekly summary</p>
            <p className="text-xs text-slate-500">Receive an overview of wins, gratitude, and better choices.</p>
          </div>
          <ToggleSwitch checked={settings.summaryEmail} disabled={isBusy} onChange={() => handleToggle('summaryEmail')} />
        </li>
      </ul>
      <div className="rounded-3xl border border-slate-100 bg-slate-50/60 px-4 py-4 text-sm text-slate-600">
        <label className="flex flex-col gap-2">
          Preferred reflection time
          <select
            value={settings.preferredReflectionTime}
            onChange={(event) => handleReflectionChange(event.target.value)}
            disabled={isBusy}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option>Sunday evening</option>
            <option>Friday bedtime</option>
            <option>Saturday morning</option>
            <option>Custom reminder (set in email)</option>
          </select>
        </label>
        <p className="mt-2 text-xs text-slate-500">We’ll send a cheerful reminder 1 hour before {reflectionCopy}.</p>
      </div>
      <footer className="text-xs">
        {error ? (
          <p className="font-semibold text-rose-500">{error}</p>
        ) : success ? (
          <p className="font-semibold text-leaf-600">{success}</p>
        ) : isBusy ? (
          <p className="text-slate-500">{loading ? 'Loading preferences…' : 'Saving your preferences…'}</p>
        ) : (
          <p className="text-slate-500">
            Entry emails are delivered automatically to every verified family member whenever entry notifications are on.
          </p>
        )}
      </footer>
    </section>
  )
}

const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    className={`group relative inline-flex h-7 w-12 items-center justify-start rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-200 focus-visible:ring-offset-2 ${
      disabled ? 'cursor-not-allowed opacity-60' : ''
    }`}
    role="switch"
    aria-checked={checked}
    aria-disabled={disabled}
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

ToggleSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

ToggleSwitch.defaultProps = {
  disabled: false,
}

export default NotificationPanel
