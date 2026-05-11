import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import App from './App.jsx'

import { CrewProvider } from './context/CrewContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CrewProvider>
      <App />
    </CrewProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}