import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d1f',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
    }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
          Kereta<span style={{ color: '#7B9FFF' }}>Sewa</span> AI
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, color: '#E5E7EB',
              padding: '9px 20px', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/login?signup=true')}
            style={{
              background: 'linear-gradient(135deg, #253BAF, #12086F)',
              border: '1px solid rgba(123,159,255,0.3)',
              borderRadius: 10, color: 'white',
              padding: '9px 20px', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: '80px 48px 60px',
        maxWidth: 760,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(123,159,255,0.1)',
          border: '1px solid rgba(123,159,255,0.25)',
          borderRadius: 20, padding: '6px 16px',
          fontSize: 12, color: '#7B9FFF',
          fontWeight: 600, marginBottom: 24,
          letterSpacing: 0.5,
        }}>
          AI-POWERED DECISION INTELLIGENCE
        </div>

        <h1 style={{
          fontSize: 52, fontWeight: 800, color: '#FFFFFF',
          lineHeight: 1.15, marginBottom: 20,
          letterSpacing: -1.5,
        }}>
          Stop guessing.<br />
          <span style={{
            background: 'linear-gradient(135deg, #7B9FFF, #253BAF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Start optimising.
          </span>
        </h1>

        <p style={{
          fontSize: 17, color: '#9CA3AF', lineHeight: 1.7,
          marginBottom: 36, maxWidth: 540, margin: '0 auto 36px',
        }}>
          KeretaSewa AI turns your booking data into clear revenue decisions.
          Built for Malaysian car rental operators with 5–50 vehicles.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/login?signup=true')}
            style={{
              background: 'linear-gradient(135deg, #253BAF, #12086F)',
              border: '1px solid rgba(123,159,255,0.3)',
              borderRadius: 12, color: 'white',
              padding: '14px 32px', fontSize: 15,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Start for free →
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, color: '#E5E7EB',
              padding: '14px 32px', fontSize: 15,
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 16, padding: '0 48px', maxWidth: 1000, margin: '0 auto 60px',
      }}>
        {[
          {
            icon: '▦',
            title: 'Utilization Snapshot',
            desc: 'See exactly which vehicles are idle and why — with color-coded performance at a glance.',
            color: '#7B9FFF',
          },
          {
            icon: '◈',
            title: 'AI Recommendations',
            desc: 'Get 2–3 high-impact actions every month with expected revenue gain and confidence scores.',
            color: '#22C55E',
          },
          {
            icon: '⊞',
            title: 'Impact Calculator',
            desc: 'See your projected revenue before and after applying each recommendation.',
            color: '#F59E0B',
          },
        ].map(f => (
          <div key={f.title} style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 24,
            borderTop: `2px solid ${f.color}22`,
          }}>
            <div style={{
              fontSize: 22, marginBottom: 12,
              color: f.color,
            }}>
              {f.icon}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>
              {f.title}
            </div>
            <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 48,
        padding: '28px 48px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 60,
      }}>
        {[
          { value: '+RM 1,140', label: 'avg monthly gain' },
          { value: '67%',       label: 'target utilization' },
          { value: '-16',       label: 'idle days saved' },
          { value: '5–50',      label: 'vehicles supported' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#7B9FFF' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '0 48px 80px' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
          Ready to optimise your fleet?
        </div>
        <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>
          Free to use. No setup required. Upload your CSV and get insights in minutes.
        </div>
        <button
          onClick={() => navigate('/login?signup=true')}
          style={{
            background: 'linear-gradient(135deg, #253BAF, #12086F)',
            border: '1px solid rgba(123,159,255,0.3)',
            borderRadius: 12, color: 'white',
            padding: '14px 36px', fontSize: 15,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          Create free account →
        </button>
      </div>

    </div>
  )
}