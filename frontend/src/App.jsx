import { useEffect, useState } from 'react'

import Home from './pages/Home'
import Apply from './pages/Apply'

import Login from './pages/members/Login'
import Dashboard from './pages/members/Dashboard'
import Garage from './pages/members/Garage'
import Events from './pages/members/Events'
import Drops from './pages/members/Drops'
import Profile from './pages/members/Profile'

import SplashScreen from './components/members/SplashScreen'

import { isAuthenticated } from './utils/auth'

function App() {
  const [loading, setLoading] = useState(true)

  const path = window.location.pathname

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1800)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <SplashScreen />
  }

  const protectedRoutes = [
    '/members/dashboard',
    '/members/garage',
    '/members/events',
    '/members/drops',
    '/members/profile',
  ]

  if (
    protectedRoutes.includes(path) &&
    !isAuthenticated()
  ) {
    window.location.href = '/members/login'

    return null
  }

  if (path === '/apply') {
    return <Apply />
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

  if (path === '/members/profile') {
    return <Profile />
  }

  return <Home />
}

export default App