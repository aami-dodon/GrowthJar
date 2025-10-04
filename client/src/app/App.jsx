import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AuthLanding from '../features/auth/pages/AuthLanding'
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import GrowthJarExperience from '../features/growthJar/GrowthJarExperience'
import { EntriesProvider } from '../features/growthJar/context/EntriesContext'
import { AuthProvider, useAuth } from '../features/auth/context/AuthContext'
import { appCopy } from '../shared/constants/appCopy'

const formatFamilyRole = (familyRole) => {
  switch (familyRole) {
    case 'mom':
      return 'Mom'
    case 'dad':
      return 'Dad'
    case 'child':
      return appCopy.childName
    default:
      return 'Family member'
  }
}

const AuthenticatedApp = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <EntriesProvider>
      <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/60 to-leaf-50/70">
        <a
          href="#growth-jar-main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-500"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">{appCopy.jarName}</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Welcome back, {user?.firstName ?? 'family'}!
              </h1>
              <p className="text-sm text-slate-600">
                Signed in as {formatFamilyRole(user?.familyRole)} — {user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="self-start rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Log out
            </button>
          </div>
        </header>
        <GrowthJarExperience />
      </div>
    </EntriesProvider>
  )
}

const RootRoute = () => {
  const { isAuthenticated, hydrated } = useAuth()

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-leaf-50">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" aria-hidden="true" />
        <span className="sr-only">Loading…</span>
      </div>
    )
  }

  return isAuthenticated ? <AuthenticatedApp /> : <AuthLanding />
}

const App = () => {
  useEffect(() => {
    const jarTitle = appCopy.childPossessiveName
      ? `${appCopy.childPossessiveName} Growth Jar`
      : 'Growth Jar'
    document.title = jarTitle

    const description = `${jarTitle} is a family gratitude ritual that helps parents and children celebrate wins, reflect on better choices, and grow together every day.`
    const descriptionElement = document.querySelector('meta[name="description"]')
    if (descriptionElement) {
      descriptionElement.setAttribute('content', description)
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
