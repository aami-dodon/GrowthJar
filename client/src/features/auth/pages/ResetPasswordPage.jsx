import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [formState, setFormState] = useState({ newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState({ state: token ? 'form' : 'error', message: token ? 'Choose a new password for your account.' : 'Reset link is missing. Request a new password reset email.' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus({ state: 'error', message: 'Reset token is missing. Please use the link from your email.' })
    }
  }, [token])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (formState.newPassword.length < 8) {
      setStatus({ state: 'error', message: 'Password must be at least 8 characters long.' })
      return
    }
    if (formState.newPassword !== formState.confirmPassword) {
      setStatus({ state: 'error', message: 'Passwords need to match before we can reset them.' })
      return
    }
    setLoading(true)
    try {
      await resetPassword({ token, newPassword: formState.newPassword })
      setStatus({ state: 'success', message: 'Your password is updated! Use it the next time you sign in.' })
      setFormState({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      setStatus({ state: 'error', message: error.message ?? 'We could not reset your password with that link.' })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/', { replace: true })
  }

  const showForm = status.state === 'form' || status.state === 'error'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-leaf-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-10 shadow-2xl shadow-slate-900/10 backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-leaf-500 text-xl font-semibold text-white shadow-lg">
          RJ
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">Reset password</h1>
        <p className="mt-2 text-sm text-slate-600">{status.message}</p>
        {showForm && token ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <label htmlFor="reset-new-password" className="block text-sm font-medium text-slate-600">
                New password
              </label>
              <input
                id="reset-new-password"
                name="newPassword"
                type="password"
                required
                value={formState.newPassword}
                onChange={handleChange}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-leaf-400 focus:ring-2 focus:ring-leaf-200"
                placeholder="Enter a new password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-slate-600">
                Confirm new password
              </label>
              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={formState.confirmPassword}
                onChange={handleChange}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-leaf-400 focus:ring-2 focus:ring-leaf-200"
                placeholder="Re-enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-leaf-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-500/40 transition hover:bg-leaf-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-500 disabled:cursor-not-allowed disabled:bg-leaf-300"
            >
              {loading ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        ) : null}
        {status.state === 'success' ? (
          <button
            type="button"
            onClick={handleBackToLogin}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Go to sign in
          </button>
        ) : null}
        {status.state === 'error' ? (
          <button
            type="button"
            onClick={handleBackToLogin}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Back to sign in
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default ResetPasswordPage
