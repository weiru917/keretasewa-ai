export default function RecommendationCards({ recommendations, loading, error }) {
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
        Analysing your fleet data...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: 16,
        background: 'rgba(248,113,113,0.08)',
        border: '1px solid rgba(248,113,113,0.25)',
        borderRadius: 12,
        color: '#FCA5A5',
        fontSize: 13,
      }}>
        AI error: {error}
      </div>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
        No recommendations yet. Upload data and click Refresh.
      </div>
    )
  }

  const confColor = (c) => {
    if (c === 'High') return { bg: 'rgba(34,197,94,0.14)', text: '#4ADE80', border: 'rgba(34,197,94,0.25)' }
    if (c === 'Low') return { bg: 'rgba(248,113,113,0.14)', text: '#F87171', border: 'rgba(248,113,113,0.25)' }
    return { bg: 'rgba(245,158,11,0.14)', text: '#FBBF24', border: 'rgba(245,158,11,0.25)' }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 14,
    }}>
      {recommendations.map((rec, i) => {
        const cc = confColor(rec.confidence)

        return (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.045)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.09)',
              padding: 18,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 12px 30px rgba(0,0,0,0.20)',
              minHeight: 220,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(123,159,255,0.55)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.28)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.20)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 12,
              alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: 13,
                color: '#FFFFFF',
                fontWeight: 700,
                lineHeight: 1.35,
              }}>
                {rec.title}
              </span>

              <span style={{
                fontSize: 11,
                padding: '4px 9px',
                borderRadius: 999,
                fontWeight: 700,
                background: cc.bg,
                color: cc.text,
                border: `1px solid ${cc.border}`,
                whiteSpace: 'nowrap',
              }}>
                {rec.confidence}
              </span>
            </div>

            <div style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 9,
              lineHeight: 1.5,
              color: '#DDE6FF',
            }}>
              {rec.action}
            </div>

            <div style={{
              fontSize: 12.5,
              color: '#AEB7CC',
              marginBottom: 13,
              lineHeight: 1.6,
            }}>
              {rec.reasoning}
            </div>

            {rec.tradeoff && (
              <div style={{
                fontSize: 11.5,
                color: '#8B95AA',
                marginBottom: 12,
                fontStyle: 'italic',
                lineHeight: 1.45,
              }}>
                Trade-off: {rec.tradeoff}
              </div>
            )}

            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {rec.impact?.revenue && (
                <span style={{
                  background: 'rgba(123,159,255,0.11)',
                  border: '1px solid rgba(123,159,255,0.18)',
                  borderRadius: 8,
                  padding: '5px 9px',
                  fontSize: 11,
                  color: '#BFD0FF',
                  fontWeight: 600,
                }}>
                  {rec.impact.revenue}
                </span>
              )}

              {rec.impact?.bookings && (
                <span style={{
                  background: 'rgba(123,159,255,0.11)',
                  border: '1px solid rgba(123,159,255,0.18)',
                  borderRadius: 8,
                  padding: '5px 9px',
                  fontSize: 11,
                  color: '#BFD0FF',
                  fontWeight: 600,
                }}>
                  {rec.impact.bookings}
                </span>
              )}

              {rec.impact?.utilization && (
                <span style={{
                  background: 'rgba(123,159,255,0.11)',
                  border: '1px solid rgba(123,159,255,0.18)',
                  borderRadius: 8,
                  padding: '5px 9px',
                  fontSize: 11,
                  color: '#BFD0FF',
                  fontWeight: 600,
                }}>
                  {rec.impact.utilization}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}