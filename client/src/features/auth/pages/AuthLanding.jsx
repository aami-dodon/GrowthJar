import { useState } from 'react'
import LoginForm from '../components/LoginForm'
import SignupForm from '../components/SignupForm'
import ForgotPasswordForm from '../components/ForgotPasswordForm'
import { appCopy } from '../../../shared/constants/appCopy'

const AuthLanding = () => {
  const [view, setView] = useState('login')
  const [showReset, setShowReset] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-leaf-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-[-10%] h-80 w-80 rounded-full bg-leaf-200/40 blur-3xl" />
        <div className="absolute right-[-10%] top-10 h-72 w-72 rounded-full bg-sunshine-200/40 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 text-center sm:text-left">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-leaf-500 text-lg font-bold text-white shadow-lg sm:mx-0">
            GJ
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{appCopy.jarName}</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">
              A joyful family ritual secured just for mom, dad, and {appCopy.childName}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Sign in to access the gratitude jar or create the trio of accounts our family needs. Every login is protected with
              email verification and reset support.
            </p>
          </div>
        </header>
        <main className="mt-12 grid flex-1 gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-sky-500/10 backdrop-blur">
            <div className="absolute -top-24 right-8 hidden h-48 w-48 rotate-12 rounded-3xl bg-gradient-to-br from-sky-400 to-leaf-400 opacity-20 blur-2xl lg:block" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Why this login matters</h2>
              <ul className="space-y-4 text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sky-500/10 text-sky-500">1</span>
                  <div>
                    <p className="font-semibold text-slate-800">Only three verified voices</p>
                    <p className="text-sm">Mom, Dad, and {appCopy.childName} each get one seat in the jar—keeps things personal and safe.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-leaf-500/10 text-leaf-600">2</span>
                  <div>
                    <p className="font-semibold text-slate-800">Email verification built in</p>
                    <p className="text-sm">We send a beautiful confirmation email so every entry comes from a trusted heart.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sunshine-500/10 text-sunshine-600">3</span>
                  <div>
                    <p className="font-semibold text-slate-800">Forgot password? No stress.</p>
                    <p className="text-sm">Reset requests arrive in minutes with a mobile-friendly template tailored for family.</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8 rounded-3xl border border-sky-200/70 bg-sky-50/80 p-5 text-sm text-slate-700">
                <p className="font-semibold text-slate-800">Need a nudge?</p>
                <p className="mt-1">
                  Once everyone is verified, logins bring you straight to the jar experience—no extra steps required.
                </p>
              </div>
            </div>
          </section>
          <section className="relative flex flex-col rounded-3xl border border-white/60 bg-white/90 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur">
            <div className="flex rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setView('login')}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  view === 'login' ? 'bg-white text-slate-900 shadow-md shadow-slate-900/10' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setView('signup')}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  view === 'signup' ? 'bg-white text-slate-900 shadow-md shadow-slate-900/10' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Create account
              </button>
            </div>
            <div className="mt-8 flex-1">
              {view === 'login' ? (
                <LoginForm onForgotPassword={() => setShowReset(true)} onSwitchToSignup={() => setView('signup')} />
              ) : (
                <SignupForm onSwitchToLogin={() => setView('login')} />
              )}
            </div>
          </section>
        </main>
      </div>
      {showReset ? <ForgotPasswordForm onClose={() => setShowReset(false)} /> : null}
    </div>
  )
}

export default AuthLanding
