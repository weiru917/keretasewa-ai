import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateReport } from '../utils/reportGenerator'

export default function ImpactCalculator({ data, recommendations }) {
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  if (!data) return null

  const { summary, vehicles } = data
  const current = summary.revenue

  // Real projected revenue — based on actual vehicle prices and booking gaps
  // Only project vehicles that are below 80% utilization
  const TARGET_UTIL = 80
  const realGain = vehicles.reduce((sum, v) => {
    if (v.utilization >= TARGET_UTIL) return sum
    const price         = v.basePrice > 0
      ? v.basePrice
      : current / (summary.total_bookings || 1)
    const potentialDays = Math.round((TARGET_UTIL / 100) * summary.days_in_month)
    const extraDays     = Math.max(0, potentialDays - v.bookedDays)
    return sum + extraDays * price
  }, 0)

  // If AI recommendations exist, use whichever is smaller (more conservative)
  const aiGain = recommendations
    ? recommendations.reduce((sum, r) => {
        const val = parseInt((r.impact?.revenue || '0').replace(/[^0-9]/g, ''))
        return sum + (isNaN(val) ? 0 : val)
      }, 0)
    : 0

  // Use AI gain if available and reasonable, otherwise use real calculation
  const gain      = aiGain > 0 && aiGain < realGain ? aiGain : realGain
  const projected = current + gain

  // Cap projected at a reasonable multiple (no more than 3x current)
  const cappedProjected = Math.min(projected, current * 3)
  const cappedGain      = cappedProjected - current

  const handleReport = async () => {
    setGenerating(true)
    try {
      await generateReport(data, recommendations)
    } finally {
      setGenerating(false)
    }
  }

  const stats = [
    {
      label: 'Current revenue',
      value: `RM ${current.toLocaleString()}`,
      color: '#9CA3AF',
    },
    {
      label: `Projected at ${TARGET_UTIL}% utilization`,
      value: `RM ${cappedProjected.toLocaleString()}`,
      color: '#7B9FFF',
    },
    {
      label: 'Potential gain / month',
      value: cappedGain > 0 ? `+RM ${cappedGain.toLocaleString()}` : 'Optimised',
      color: '#22C55E',
    },
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
      marginTop: 20,
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

      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
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
            background: generating
              ? 'rgba(37,59,175,0.5)'
              : 'linear-gradient(135deg, #253BAF, #12086F)',
            border: '1px solid rgba(123,159,255,0.3)',
            borderRadius: 10, color: 'white',
            padding: '10px 18px', fontSize: 13,
            fontWeight: 500,
            cursor: generating ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  )
}