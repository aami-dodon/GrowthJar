import { useState } from 'react'
import { requestPasswordReset } from '../api/authApi'
import { appCopy } from '../../../shared/constants/appCopy'

const ForgotPasswordForm = ({ onClose }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: 'info', message: 'Enter the email you used when creating the family account.' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setStatus({
        type: 'success',
        message: 'If that email exists, we just sent password reset instructions.',
      })
      setEmail('')
    } catch (error) {
      setStatus({ type: 'error', message: error.message ?? 'Could not start the reset flow right now.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 py-8">
      <div className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/95 p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          aria-label="Close password reset"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold text-slate-900">Reset password</h2>
        <p className="mt-1 text-sm text-slate-600">
          We&apos;ll email you a secure link to choose a new password for {appCopy.jarName}.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="reset-email" className="block text-sm font-medium text-slate-600">
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              placeholder="you@example.com"
            />
          </div>
          {status?.message ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-leaf-200 bg-leaf-50 text-leaf-700'
                  : status.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {status.message}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Sending instructions…' : 'Email reset link'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
