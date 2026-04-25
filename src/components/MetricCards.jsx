export default function MetricCards({ data }) {
  if (!data) return null
  const { summary, vehicles } = data

  const lowestUtil  = vehicles.length > 0 ? Math.min(...vehicles.map(v => v.utilization)) : 0
  const highestUtil = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.utilization)) : 0

  // Potential revenue = if all vehicles hit 80% utilization
  const TARGET_UTIL   = 80
  const potentialGain = vehicles.reduce((sum, v) => {
  const price         = v.basePrice > 0 ? v.basePrice : (summary.revenue / (summary.total_bookings || 1))
  const potentialDays = Math.round((TARGET_UTIL / 100) * summary.days_in_month)
  const extraDays     = Math.max(0, potentialDays - v.bookedDays)
  return sum + extraDays * price
}, 0)
const projected = summary.revenue + potentialGain
const cappedProjected = Math.min(projected, summary.revenue * 3)
const cappedGain = cappedProjected - summary.revenue

  // Idle days that could be recovered (vehicles below 80%)
  const recoverableIdleDays = vehicles.reduce((sum, v) => {
    const potentialDays = Math.round((TARGET_UTIL / 100) * summary.days_in_month)
    return sum + Math.max(0, potentialDays - v.bookedDays)
  }, 0)

  const cards = [
{
  label: 'Monthly Revenue',
  value: `RM ${summary.revenue.toLocaleString()}`,
  sub: cappedGain > 0
    ? `Could reach RM ${cappedProjected.toLocaleString()} with improved utilization`
    : 'At full potential',
  up: cappedGain > 0,
  accent: '#7B9FFF',
},
  {
    label:  'Fleet Utilization',
    value:  `${summary.utilization}%`,
    sub:    summary.utilization < TARGET_UTIL
              ? `${TARGET_UTIL - summary.utilization}% below target — room to grow`
              : ' Above target',
    up:     summary.utilization < TARGET_UTIL,
    accent: '#22C55E',
  },
  {
    label:  'Idle Days',
    value:  summary.idle_days,
    sub:    recoverableIdleDays > 0
              ? `${recoverableIdleDays} days of earning opportunity unused`
              : 'Fully optimised',
    up:     false,
    accent: '#EF4444',
  },
  {
    label:  'Total Bookings',
    value:  summary.total_bookings,
    sub:    `${summary.days_in_month}-day month · ${vehicles.length} vehicles`,
    up:     null,
    accent: '#F59E0B',
  },
]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          borderTop: `2px solid ${c.accent}`,
        }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8, fontWeight: 500 }}>{c.label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.5 }}>{c.value}</div>
          <div style={{
            fontSize: 11, marginTop: 6,
            color: c.up === true ? '#22C55E' : c.up === false ? '#EF4444' : '#9CA3AF',
            fontWeight: 500,
          }}>
            {c.up === true ? '▲ ' : c.up === false ? '▼ ' : ''}{c.sub}
          </div>
        </div>
      ))}
    </div>
  )
}