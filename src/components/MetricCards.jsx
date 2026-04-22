export default function MetricCards({ data }) {
  if (!data) return null
  const { summary } = data

  const cards = [
    {
      label: 'Monthly Revenue',
      value: `RM ${summary.revenue.toLocaleString()}`,
      sub: '+RM 1,140 potential',
      up: true,
      accent: '#7B9FFF',
    },
    {
      label: 'Fleet Utilization',
      value: `${summary.utilization}%`,
      sub: 'Target: 67%',
      up: true,
      accent: '#22C55E',
    },
    {
      label: 'Idle Days',
      value: summary.idle_days,
      sub: '-16 days possible',
      up: false,
      accent: '#EF4444',
    },
    {
      label: 'Total Bookings',
      value: summary.total_bookings,
      sub: 'This month',
      up: null,
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