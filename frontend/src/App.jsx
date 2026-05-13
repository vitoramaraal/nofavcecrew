import { useEffect, useState } from 'react'

import Home from './pages/Home'
import Apply from './pages/Apply'
import Verify from './pages/Verify'

import Login from './pages/members/Login'
import Dashboard from './pages/members/Dashboard'
import Garage from './pages/members/Garage'
import Events from './pages/members/Events'
import Drops from './pages/members/Drops'
import Feed from './pages/members/Feed'
import Profile from './pages/members/Profile'
import Chat from './pages/members/Chat'
import Admin from './pages/Admin'

import SplashScreen from './components/members/SplashScreen'

import {
  isAuthenticated,
  logout,
  validateStoredMemberSession,
} from './utils/auth'

const protectedRoutes = [
  '/members/dashboard',
  '/members/garage',
  '/members/events',
  '/members/drops',
  '/members/feed',
  '/members/chat',
  '/members/profile',
]

function App() {
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  const path = window.location.pathname
  const isProtectedRoute = protectedRoutes.includes(path)

  const shouldRedirectToLogin =
    isProtectedRoute &&
    !isAuthenticated()

  useEffect(() => {
    let isMounted = true

    async function validateRouteAccess() {
      setSessionError('')

      const splashDelay = new Promise((resolve) => {
        setTimeout(resolve, 1800)
      })

      try {
        if (isProtectedRoute && isAuthenticated()) {
          const member = await validateStoredMemberSession()

          if (!member) {
            return
          }
        }
      } catch (error) {
        console.error(error)

        if (isMounted) {
          setSessionError(
            'Nao foi possivel validar sua sessao. Verifique a conexao e tente novamente.',
          )
        }
      } finally {
        await splashDelay

        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void validateRouteAccess()

    return () => {
      isMounted = false
    }
  }, [isProtectedRoute, path])

  useEffect(() => {
    if (!loading && shouldRedirectToLogin && !sessionError) {
      window.location.href = '/members/login'
    }
  }, [loading, sessionError, shouldRedirectToLogin])

  if (loading) {
    return <SplashScreen />
  }

  if (sessionError && isProtectedRoute) {
    return <SessionValidationError message={sessionError} />
  }

  if (shouldRedirectToLogin) {
    return null
  }

  if (path === '/apply') {
    return <Apply />
  }

  if (path.startsWith('/verify/')) {
    return <Verify />
  }

  if (path === '/members' || path === '/members/login') {
    return <Login />
  }

  if (path === '/members/dashboard') {
    return <Dashboard />
  }

  if (path === '/members/garage') {
    return <Garage />
  }

  if (path === '/members/events') {
    return <Events />
  }

  if (path === '/members/drops') {
    return <Drops />
  }

  if (path === '/members/feed') {
    return <Feed />
  }

  if (path === '/members/chat') {
    return <Chat />
  }

  if (path === '/members/profile') {
    return <Profile />
  }

  if (path === '/admin') {
    return <Admin />
  }

  return <Home />
}

export default App

function SessionValidationError({ message }) {
  function handleLogout() {
    logout()

    window.location.href = '/members/login'
  }

  return (
    <main className="flex min-h-screen items-center bg-black px-6 text-white">
      <section className="mx-auto w-full max-w-md rounded-[2rem] border border-white/5 bg-zinc-900/70 p-6">
        <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
          NOFVCE
        </p>

        <h1 className="mt-4 text-4xl font-black uppercase leading-none">
          Sessao
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/45">
          {message}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/45"
          >
            Tentar novamente
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-red-300"
          >
            Sair
          </button>
        </div>
      </section>
    </main>
  )
}
