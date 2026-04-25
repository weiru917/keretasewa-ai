import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  getUserProfile,
  getBookings,
  getVehicles,
} from './utils/firestoreService'
import { processFleetData } from './utils/dataProcessor'
import { useFleetStore } from './store/fleetStore'
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
  const {
    hasData, setUserProfile, setRawData,
    setProcessedData, setAIRecommendations, clearAll,
  } = useFleetStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        try {
          // Load all user data from Firestore in parallel
          const [profile, bookings, vehicles, recommendations] = await Promise.all([
            getUserProfile(u.uid),
            getBookings(u.uid),
            getVehicles(u.uid),
          ])

          if (profile)         setUserProfile(profile)
          if (recommendations) setAIRecommendations(recommendations)

          // If they have saved fleet data, process it
          if (bookings.length > 0 && vehicles.length > 0) {
            setRawData(bookings, vehicles)
            setProcessedData(processFleetData(bookings, vehicles))
          }
          // if no bookings/vehicles -> hasData stays false -> routed to /data
        } catch (e) {
          console.error('Error loading user data:', e)
        }
      } else {
        setUser(null)
        clearAll()
      }
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>
            Kereta<span style={{ color: '#7B9FFF' }}>Sewa</span> AI
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Loading your fleet data...</div>
        </div>
      </div>
    )
  }

  // Smart redirect to data page to upload data if they haven't done so yet
  const homeElement = !user
    ? <Navigate to="/landing" replace />
    : !hasData
      ? <Navigate to="/data" replace />        // no data -> upload first
      : <ProtectedLayout><Dashboard /></ProtectedLayout>

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