import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFleetStore } from '../store/fleetStore'
import { processFleetData } from '../utils/dataProcessor'
import { mockBookings, mockVehicles } from '../data/mockData'
import MetricCards from '../components/MetricCards'
import UtilizationChart from '../components/UtilizationChart'
import WeekdayChart from '../components/WeekdayChart'
import RecommendationCards from '../components/RecommendationCards'
import ImpactCalculator from '../components/ImpactCalculator'

export default function Dashboard() {
  const navigate = useNavigate()
  const { processedData, setProcessedData, aiRecommendations, aiLoading, aiError } = useFleetStore()

  useEffect(() => {
    if (!processedData) {
      setProcessedData(processFleetData(mockBookings, mockVehicles))
    }
  }, [])

  return (
    <div style={{ padding: 28, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.3 }}>
            Fleet Overview
          </h1>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>April 2026 · 5 vehicles</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, color: '#E5E7EB',
              padding: '9px 18px', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            ↻ Refresh AI
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
            + Add Data
          </button>
        </div>
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
            color: '#7B9FFF',
            fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600,
          }}>
            {aiRecommendations?.length || 0} actions
          </span>
        </div>
        <RecommendationCards
          recommendations={aiRecommendations}
          loading={aiLoading}
          error={aiError}
        />
      </div>

      <ImpactCalculator data={processedData} recommendations={aiRecommendations} />
    </div>
  )
}