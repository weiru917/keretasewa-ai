// Person B populates aiRecommendations in fleetStore
// This component just displays whatever JSON they produce
// Expected shape per recommendation:
// { title, action, reasoning, confidence, impact: { revenue, bookings, utilization }, tradeoff }

export default function RecommendationCards({ recommendations, loading, error }) {
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        Analysing your fleet data...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 20, background: '#fff3f3', borderRadius: 10, color: '#C62828', fontSize: 13 }}>
        AI error: {error}
      </div>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>
        No recommendations yet. Upload data and click Refresh.
      </div>
    )
  }

  const confColor = (c) => c === 'High' ? { bg: '#e8f5e9', text: '#1B5E20' } : { bg: '#fff8e1', text: '#E65100' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
      {recommendations.map((rec, i) => {
        const cc = confColor(rec.confidence)
        return (
          <div key={i} style={{
            background: 'white',
            borderRadius: 12,
            border: '0.5px solid #e0e0e0',
            padding: 16,
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#253BAF'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#888' }}>{rec.title}</span>
              <span style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 500,
                background: cc.bg, color: cc.text,
              }}>
                {rec.confidence}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, lineHeight: 1.4 }}>
              {rec.action}
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>
              {rec.reasoning}
            </div>
            {rec.tradeoff && (
              <div style={{ fontSize: 11, color: '#999', marginBottom: 10, fontStyle: 'italic' }}>
                Trade-off: {rec.tradeoff}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {rec.impact?.revenue && (
                <span style={{ background: '#f0f2ff', borderRadius: 6, padding: '4px 8px', fontSize: 11 }}>
                  <strong style={{ color: '#253BAF' }}>{rec.impact.revenue}</strong>/mo
                </span>
              )}
              {rec.impact?.bookings && (
                <span style={{ background: '#f0f2ff', borderRadius: 6, padding: '4px 8px', fontSize: 11 }}>
                  <strong style={{ color: '#253BAF' }}>{rec.impact.bookings}</strong> bookings
                </span>
              )}
              {rec.impact?.utilization && (
                <span style={{ background: '#f0f2ff', borderRadius: 6, padding: '4px 8px', fontSize: 11 }}>
                  <strong style={{ color: '#253BAF' }}>{rec.impact.utilization}</strong> util
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}