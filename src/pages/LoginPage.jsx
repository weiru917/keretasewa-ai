import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#E5E7EB',
    padding: '12px 14px', fontSize: 14,
    outline: 'none', marginBottom: 12,
    boxSizing: 'border-box',
  }

  const handleSubmit = async () => {
    setError('')
    if (isSignUp && password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (name) await updateProfile(cred.user, { displayName: name })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/')
    } catch (e) {
      setError(e.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d1f',
      display: 'flex',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Left panel — branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, #12086F 0%, #0d0d1f 60%)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ fontSize: 20, fontWeight: 800, color: 'white', cursor: 'pointer' }}
        >
          Kereta<span style={{ color: '#7B9FFF' }}>Sewa</span> AI
        </div>

        {/* Middle content */}
        <div>
          <div style={{
            fontSize: 32, fontWeight: 800, color: '#FFFFFF',
            lineHeight: 1.3, marginBottom: 16, letterSpacing: -0.5,
          }}>
            Decision intelligence<br />for car rental operators
          </div>
          <div style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.7, marginBottom: 32 }}>
            Upload your booking data and get AI-powered recommendations
            to maximise fleet utilization and revenue.
          </div>

          {/* Testimonial-style stats */}
          {[
            { value: '+RM 1,140/mo', label: 'average revenue improvement' },
            { value: '7%',           label: 'average utilization gain'     },
            { value: '16 days',      label: 'average idle days saved'      },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: 14,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#7B9FFF',
                boxShadow: '0 0 8px #7B9FFF',
                flexShrink: 0,
              }} />
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#7B9FFF' }}>{s.value}</span>
                <span style={{ fontSize: 13, color: '#9CA3AF', marginLeft: 6 }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: '#4B5563' }}>
          © 2026 KeretaSewa AI · Built for Malaysian SME operators
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: 420,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%' }}>

          {/* Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12, padding: 4, marginBottom: 28,
          }}>
            {['Sign in', 'Sign up'].map((label, i) => (
              <button
                key={label}
                onClick={() => { setIsSignUp(i === 1); setError('') }}
                style={{
                  flex: 1, padding: '9px', borderRadius: 9, border: 'none',
                  background: (i === 1) === isSignUp
                    ? 'rgba(123,159,255,0.2)' : 'transparent',
                  color: (i === 1) === isSignUp ? '#7B9FFF' : '#6B7280',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>
              {isSignUp
                ? 'Start optimising your fleet today'
                : 'Sign in to your KeretaSewa dashboard'}
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '10px 14px',
              color: '#EF4444', fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {isSignUp && (
            <input
              style={inputStyle}
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          )}

          <input
            style={inputStyle}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => !isSignUp && e.key === 'Enter' && handleSubmit()}
          />

          {isSignUp && (
            <input
              style={inputStyle}
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? 'rgba(37,59,175,0.5)'
                : 'linear-gradient(135deg, #253BAF, #12086F)',
              border: '1px solid rgba(123,159,255,0.3)',
              borderRadius: 10, color: 'white',
              padding: '13px', fontSize: 14,
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4, transition: 'all 0.2s',
            }}
          >
            {loading
              ? 'Please wait...'
              : isSignUp ? 'Create account' : 'Sign in'}
          </button>

          <div style={{
            textAlign: 'center', marginTop: 20,
            fontSize: 13, color: '#6B7280',
          }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              style={{ color: '#7B9FFF', cursor: 'pointer', fontWeight: 500 }}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}