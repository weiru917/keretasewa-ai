import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFleetStore } from '../store/fleetStore'
import { processFleetData, getAvailableMonths } from '../utils/dataProcessor'
import { useAIRecommendations } from '../hooks/useAI'
import MetricCards from '../components/MetricCards'
import UtilizationChart from '../components/UtilizationChart'
import WeekdayChart from '../components/WeekdayChart'
import RecommendationCards from '../components/RecommendationCards'
import ImpactCalculator from '../components/ImpactCalculator'
import AskAIPanel from '../components/askAIpanel'

function formatMonth(m) {
  if (!m || !m.includes('-')) return ''
  const [y, mon] = m.split('-')
  const date = new Date(parseInt(y), parseInt(mon) - 1)
  if (isNaN(date.getTime())) return m
  return date.toLocaleString('en-MY', { month: 'long', year: 'numeric' })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    rawBookings, rawVehicles, userProfile,
    aiRecommendations, aiLoading, aiError,
  } = useFleetStore()
  const { fetchRecommendations } = useAIRecommendations()
  const [monthOpen, setMonthOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const availableMonths = getAvailableMonths(rawBookings)  

  // Update selectedMonth once availableMonths is known
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0])
    }
  }, [availableMonths.length])

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0])
    }
  }, [availableMonths.length])

const processedData = rawBookings.length > 0
  ? processFleetData(rawBookings, rawVehicles, selectedMonth)
  : null

  useEffect(() => {
    if (processedData && !aiRecommendations && !aiLoading) {
      fetchRecommendations()
    }
  }, [processedData, aiRecommendations, aiLoading, fetchRecommendations])

  if (!processedData) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 14, color: '#9CA3AF' }}>No fleet data found.</div>
        <button onClick={() => navigate('/data')} style={{
          background: 'linear-gradient(135deg, #253BAF, #12086F)',
          border: '1px solid rgba(123,159,255,0.3)',
          borderRadius: 10, color: 'white',
          padding: '10px 20px', fontSize: 13,
          fontWeight: 500, cursor: 'pointer',
        }}>
          Upload your data →
        </button>
      </div>
    )
  }

  const { summary } = processedData
  const greeting = userProfile?.displayName
    ? `Welcome back, ${userProfile.displayName}`
    : 'Fleet Overview'

  return (
    <div style={{ padding: 28, minHeight: '100vh' }} onClick={() => setMonthOpen(false)}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.3 }}>
            {greeting}
          </h1>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
            {summary.total_bookings} bookings · {processedData.vehicles.length} vehicles
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>

          {/* Custom month picker */}
          {availableMonths.length > 0 && (
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setMonthOpen(o => !o)}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, color: '#E5E7EB',
                  padding: '9px 14px', fontSize: 13,
                  fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  minWidth: 170,
                }}
              >
                <span style={{ flex: 1, textAlign: 'left' }}>
                  {formatMonth(selectedMonth)}
                </span>
                <span style={{
                  fontSize: 10, color: '#6B7280',
                  transform: monthOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}>▼</span>
              </button>

              {monthOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#1a1a35',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, overflow: 'hidden',
                  zIndex: 999, minWidth: 180,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                  {availableMonths.map(m => (
                    <div
                      key={m}
                      onClick={() => { setSelectedMonth(m); setMonthOpen(false) }}
                      style={{
                        padding: '10px 16px',
                        fontSize: 13,
                        color: m === selectedMonth ? '#7B9FFF' : '#E5E7EB',
                        background: m === selectedMonth
                          ? 'rgba(123,159,255,0.15)' : 'transparent',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.15s',
                        fontWeight: m === selectedMonth ? 600 : 400,
                      }}
                      onMouseEnter={e => {
                        if (m !== selectedMonth)
                          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                      }}
                      onMouseLeave={e => {
                        if (m !== selectedMonth)
                          e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {formatMonth(m)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => fetchRecommendations()}
            disabled={aiLoading}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, color: '#E5E7EB',
              padding: '9px 18px', fontSize: 13,
              fontWeight: 500,
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              opacity: aiLoading ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            {aiLoading ? '⟳ Loading...' : '↻ Refresh AI'}
          </button>

          <button
            onClick={() => navigate('/data')}
            style={{
              background: 'linear-gradient(135deg, #253BAF, #12086F)',
              border: '1px solid rgba(123,159,255,0.3)',
              borderRadius: 10, color: 'white',
              padding: '9px 18px', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            + Update Data
          </button>
        </div>
      </div>

      {/* Month badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(123,159,255,0.08)',
        border: '1px solid rgba(123,159,255,0.2)',
        borderRadius: 20, padding: '5px 14px',
        fontSize: 12, color: '#7B9FFF', fontWeight: 500,
        marginBottom: 20,
      }}>
        📅 Showing {formatMonth(selectedMonth)}
      </div>

      <MetricCards data={processedData} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
        <UtilizationChart data={processedData} />
        <WeekdayChart data={processedData} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB', letterSpacing: 0.3 }}>
            AI Recommendations
          </h2>
          <span style={{
            background: 'rgba(123,159,255,0.2)',
            border: '1px solid rgba(123,159,255,0.3)',
            color: '#7B9FFF', fontSize: 11,
            padding: '2px 10px', borderRadius: 20, fontWeight: 600,
          }}>
            {aiRecommendations?.length || 0} actions
          </span>
          <span style={{ fontSize: 11, color: '#6B7280' }}>
            based on {formatMonth(selectedMonth)}
          </span>
        </div>
        <RecommendationCards
          recommendations={aiRecommendations}
          loading={aiLoading}
          error={aiError}
        />
      </div>

      <ImpactCalculator data={processedData} recommendations={aiRecommendations} />

      <AskAIPanel />
    </div>
  )
}