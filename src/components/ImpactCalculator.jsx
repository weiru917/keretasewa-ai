import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateReport } from '../utils/reportGenerator'

export default function ImpactCalculator({ data, recommendations }) {
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)

  if (!data) return null

  const before = data.summary.revenue
  const gain = recommendations
    ? recommendations.reduce((sum, r) => {
        const val = parseInt((r.impact?.revenue || '0').replace(/[^0-9]/g, ''))
        return sum + val
      }, 0)
    : 1140
  const after = before + gain
  const cost = 299
  const net = gain - cost

  const handleReport = async () => {
    setGenerating(true)
    try {
      await generateReport(data, recommendations)
    } finally {
      setGenerating(false)
    }
  }

  const stats = [
    { label: 'Current revenue',   value: `RM ${before.toLocaleString()}`, color: '#9CA3AF' },
    { label: 'Projected revenue', value: `RM ${after.toLocaleString()}`,  color: '#7B9FFF' },
    { label: 'Net gain / month',  value: `+RM ${net.toLocaleString()}`,   color: '#22C55E' },
  ]

  return (
    <div style={{
      background: 'rgba(123,159,255,0.08)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(123,159,255,0.2)',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
          {i < stats.length - 1 && (
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }}>→</div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => navigate('/data')}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, color: '#E5E7EB',
            padding: '10px 18px', fontSize: 13,
            fontWeight: 500, cursor: 'pointer',
          }}
        >
          + Add Data
        </button>
        <button
          onClick={handleReport}
          disabled={generating}
          style={{
            background: generating ? 'rgba(37,59,175,0.5)' : 'linear-gradient(135deg, #253BAF, #12086F)',
            border: '1px solid rgba(123,159,255,0.3)',
            borderRadius: 10, color: 'white',
            padding: '10px 18px', fontSize: 13,
            fontWeight: 500, cursor: generating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  )
}