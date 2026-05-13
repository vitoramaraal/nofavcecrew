import { useEffect, useState } from 'react'

import Home from './pages/Home'
import Apply from './pages/Apply'
import Verify from './pages/Verify'

import Login from './pages/members/Login'
import Dashboard from './pages/members/Dashboard'
import Garage from './pages/members/Garage'
import Events from './pages/members/Events'
import Drops from './pages/members/Drops'
import Profile from './pages/members/Profile'
import Chat from './pages/members/Chat'
import Admin from './pages/Admin'

import SplashScreen from './components/members/SplashScreen'

import { isAuthenticated } from './utils/auth'

function App() {
  const [loading, setLoading] = useState(true)

  const path = window.location.pathname
  const protectedRoutes = [
    '/members/dashboard',
    '/members/garage',
    '/members/events',
    '/members/drops',
    '/members/chat',
    '/members/profile',
  ]

  const shouldRedirectToLogin =
    protectedRoutes.includes(path) &&
    !isAuthenticated()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1800)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loading && shouldRedirectToLogin) {
      window.location.href = '/members/login'
    }
  }, [loading, shouldRedirectToLogin])

  if (loading) {
    return <SplashScreen />
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
