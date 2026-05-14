import { lazy, Suspense, useEffect, useState } from 'react'

import SplashScreen from './components/members/SplashScreen'

import {
  isAuthenticated,
  logout,
  validateStoredMemberSession,
} from './utils/auth'

const Home = lazy(() => import('./pages/Home'))
const Apply = lazy(() => import('./pages/Apply'))
const Verify = lazy(() => import('./pages/Verify'))
const Login = lazy(() => import('./pages/members/Login'))
const Dashboard = lazy(() => import('./pages/members/Dashboard'))
const Garage = lazy(() => import('./pages/members/Garage'))
const Events = lazy(() => import('./pages/members/Events'))
const Drops = lazy(() => import('./pages/members/Drops'))
const Feed = lazy(() => import('./pages/members/Feed'))
const Profile = lazy(() => import('./pages/members/Profile'))
const Chat = lazy(() => import('./pages/members/Chat'))
const Admin = lazy(() => import('./pages/Admin'))

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

  let routeContent = <Home />

  if (path === '/apply') {
    routeContent = <Apply />
  } else if (path.startsWith('/verify/')) {
    routeContent = <Verify />
  } else if (path === '/members' || path === '/members/login') {
    routeContent = <Login />
  } else if (path === '/members/dashboard') {
    routeContent = <Dashboard />
  } else if (path === '/members/garage') {
    routeContent = <Garage />
  } else if (path === '/members/events') {
    routeContent = <Events />
  } else if (path === '/members/drops') {
    routeContent = <Drops />
  } else if (path === '/members/feed') {
    routeContent = <Feed />
  } else if (path === '/members/chat') {
    routeContent = <Chat />
  } else if (path === '/members/profile') {
    routeContent = <Profile />
  } else if (path === '/admin') {
    routeContent = <Admin />
  }

  return <Suspense fallback={<SplashScreen />}>{routeContent}</Suspense>
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
