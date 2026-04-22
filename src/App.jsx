import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DataPage from './pages/DataPage'
import AskAIPage from './pages/AskAIPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'

function ProtectedLayout({ children }) {
  return (
    <div style={{ display: 'flex', background: '#0d0d1f', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 210, flex: 1 }}>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser]     = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0d1f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#7B9FFF', fontSize: 14, fontFamily: 'Inter, system-ui',
      }}>
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login"   element={user ? <Navigate to="/" replace /> : <LoginPage />} />

        {/* Default: if not logged in → landing, if logged in → dashboard */}
        <Route path="/" element={
          user
            ? <ProtectedLayout><Dashboard /></ProtectedLayout>
            : <Navigate to="/landing" replace />
        }/>

        {/* Protected routes */}
        <Route path="/data" element={
          user ? <ProtectedLayout><DataPage /></ProtectedLayout>
               : <Navigate to="/landing" replace />
        }/>
        <Route path="/ask-ai" element={
          user ? <ProtectedLayout><AskAIPage /></ProtectedLayout>
               : <Navigate to="/landing" replace />
        }/>
        <Route path="/settings" element={
          user ? <ProtectedLayout><SettingsPage /></ProtectedLayout>
               : <Navigate to="/landing" replace />
        }/>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? '/' : '/landing'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}