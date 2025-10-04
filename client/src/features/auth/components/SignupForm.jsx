import { useMemo, useState } from 'react'
import { signup as signupRequest } from '../api/authApi'

const FAMILY_ROLES = [
  {
    value: 'mom',
    label: 'Mom',
    description: 'Guides the nightly reflections with heart.',
    accent: 'bg-rose-100 text-rose-600',
  },
  {
    value: 'dad',
    label: 'Dad',
    description: 'Keeps the ritual consistent and joyful.',
    accent: 'bg-sky-100 text-sky-600',
  },
  {
    value: 'rishi',
    label: 'Rishi',
    description: 'Our superstar kid storyteller.',
    accent: 'bg-leaf-100 text-leaf-600',
  },
]

const defaultForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  familyRole: 'mom',
}

const SignupForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState(defaultForm)
  const [status, setStatus] = useState({ type: 'info', message: 'Only three accounts can be created—one mom, one dad, and one Rishi.' })
  const [loading, setLoading] = useState(false)

  const roleMetadata = useMemo(() => FAMILY_ROLES.find((role) => role.value === formData.familyRole), [formData.familyRole])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ type: null, message: null })

    if (formData.password.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters long.' })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords must match before we can create your account.' })
      return
    }

    setLoading(true)
    try {
      const role = formData.familyRole === 'rishi' ? 'child' : 'parent'
      await signupRequest({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        role,
        familyRole: formData.familyRole,
      })
      setStatus({
        type: 'success',
        message: 'Success! Check your inbox for a verification email before signing in.',
      })
      setFormData((prev) => ({ ...defaultForm, familyRole: prev.familyRole }))
    } catch (error) {
      setStatus({ type: 'error', message: error.message ?? 'We could not create your account right now.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="signup-first-name" className="block text-sm font-medium text-slate-600">
            First name
          </label>
          <input
            id="signup-first-name"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-leaf-400 focus:ring-2 focus:ring-leaf-200"
            placeholder="Rishi"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-last-name" className="block text-sm font-medium text-slate-600">
            Last name (optional)
          </label>
          <input
            id="signup-last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-leaf-400 focus:ring-2 focus:ring-leaf-200"
            placeholder="Family"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="signup-email" className="block text-sm font-medium text-slate-600">
          Email address
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-leaf-400 focus:ring-2 focus:ring-leaf-200"
          placeholder="mom@example.com"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="signup-password" className="block text-sm font-medium text-slate-600">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-leaf-400 focus:ring-2 focus:ring-leaf-200"
            placeholder="Create a password"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-600">
            Confirm password
          </label>
          <input
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-leaf-400 focus:ring-2 focus:ring-leaf-200"
            placeholder="Re-enter password"
          />
        </div>
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-600">Who are you signing up as?</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {FAMILY_ROLES.map((role) => {
            const isActive = formData.familyRole === role.value
            return (
              <button
                type="button"
                key={role.value}
                onClick={() => setFormData((prev) => ({ ...prev, familyRole: role.value }))}
                className={`rounded-3xl border px-4 py-4 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-500 ${
                  isActive
                    ? 'border-transparent bg-gradient-to-br from-leaf-500/95 to-sky-500/80 text-white shadow-leaf-500/30'
                    : 'border-slate-200 bg-white/80 text-slate-700 hover:border-leaf-300 hover:bg-leaf-50/70'
                }`}
              >
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isActive ? 'bg-white/20 text-white' : role.accent
                  }`}
                >
                  {role.label}
                </span>
                <p className="mt-2 text-sm font-medium">{role.description}</p>
              </button>
            )
          })}
        </div>
        {roleMetadata ? (
          <p className="text-xs text-slate-500">
            Selecting <span className="font-semibold text-leaf-600">{roleMetadata.label}</span> reserves this single account for the
            email configured by the family.
          </p>
        ) : null}
      </fieldset>
      {status?.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'border-leaf-200 bg-leaf-50 text-leaf-700'
              : status.type === 'error'
              ? 'border-red-200 bg-red-50/90 text-red-700'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {status.message}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-full bg-leaf-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-500/40 transition hover:bg-leaf-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-500 disabled:cursor-not-allowed disabled:bg-leaf-300"
      >
        {loading ? 'Creating account…' : 'Create account & send verification'}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already verified?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-sky-600 transition hover:text-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          Sign in instead
        </button>
      </p>
    </form>
  )
}

export default SignupForm
