import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/authApi'
import { appCopy } from '../../../shared/constants/appCopy'

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState({ state: 'loading', message: 'Verifying your email…' })
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const runVerification = async () => {
      if (!token) {
        if (!isMounted) return
        setStatus({ state: 'error', message: 'Verification token is missing. Please open the email link again.' })
        return
      }

      try {
        await verifyEmail(token)
        if (!isMounted) return
        setStatus({
          state: 'success',
          message: `Your email is verified! You can sign in to ${appCopy.jarName} now.`,
        })
      } catch (error) {
        if (!isMounted) return
        setStatus({ state: 'error', message: error.message ?? 'We could not verify that token. Request a new link and try again.' })
      }
    }

    runVerification()

    return () => {
      isMounted = false
    }
  }, [token])

  const handleBackHome = () => {
    navigate('/', { replace: true })
  }

  const isLoading = status.state === 'loading'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-leaf-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-10 text-center shadow-2xl shadow-sky-500/20 backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-leaf-500 text-xl font-semibold text-white shadow-lg">
          GJ
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">Email verification</h1>
        <p className="mt-2 text-sm text-slate-600">{status.message}</p>
        {isLoading ? (
          <div className="mt-8 flex justify-center">
            <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" aria-hidden="true" />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleBackHome}
            className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              status.state === 'success'
                ? 'bg-leaf-500 hover:bg-leaf-600 focus-visible:outline-leaf-500'
                : 'bg-slate-900 hover:bg-slate-800 focus-visible:outline-slate-900'
            }`}
          >
            {status.state === 'success' ? 'Return to sign in' : 'Back to sign in' }
          </button>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage
