import { NavLink, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

const navItems = [
  { to: '/',         label: 'Dashboard', icon: '▦' },
  { to: '/data',     label: 'Data',      icon: '⊞'  },
  { to: '/ask-ai',   label: 'Ask AI',    icon: '◈'  },
  { to: '/settings', label: 'Settings',  icon: '⊙'  },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/landing')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{
      width: 210,
      minHeight: '100vh',
      background: 'rgba(10,10,30,0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0, top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: 0.5 }}>
          Kereta<span style={{ color: '#7B9FFF' }}>Sewa</span> AI
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
          AI Decision Intelligence
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ marginTop: 12, flex: 1 }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 20px',
              margin: '2px 10px',
              borderRadius: 10,
              color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(123,159,255,0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(123,159,255,0.2)' : '1px solid transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: 14, opacity: 0.8 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '12px 10px 24px' }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: 12 }} />
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '11px 20px',
            borderRadius: 10,
            color: '#EF4444',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
        >
          <span>⎋</span>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )
}