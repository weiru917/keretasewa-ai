import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeekdayChart({ data }) {
  if (!data) return null
  const { trend } = data
  const chartData = [
    { name: 'Weekday', value: trend.weekday_pct, color: '#4F6BFF' },
    { name: 'Weekend', value: trend.weekend_pct, color: '#7B9FFF' },
  ]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#E5E7EB', letterSpacing: 0.3 }}>
        Weekday vs Weekend
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <ResponsiveContainer width={110} height={110}>
          <PieChart>
            <Pie data={chartData} dataKey="value" innerRadius={30} outerRadius={50} paddingAngle={4}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip
              formatter={v => `${v}%`}
              contentStyle={{
                background: 'rgba(17,24,39,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#fff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {chartData.map(d => (
            <div key={d.name} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: d.color,
                    boxShadow: `0 0 6px ${d.color}`,
                    display: 'inline-block',
                  }}/>
                  {d.name}
                </span>
                <span style={{ fontSize: 12, color: '#E5E7EB', fontWeight: 600 }}>{d.value}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${d.value}%`, background: d.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 8, fontStyle: 'italic' }}>
            Weekday pricing opportunity exists
          </div>
        </div>
      </div>
    </div>
  )
}