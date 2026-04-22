import { useNavigate } from 'react-router-dom'
import CSVUpload from '../components/CSVUpload'
import { useFleetStore } from '../store/fleetStore'
import { processFleetData } from '../utils/dataProcessor'
import { mockVehicles } from '../data/mockData'

export default function DataPage() {
  const navigate = useNavigate()
  const { rawBookings, setRawData, setProcessedData } = useFleetStore()

  const handleDataLoaded = (bookings) => {
    setRawData(bookings, mockVehicles)
    setProcessedData(processFleetData(bookings, mockVehicles))
  }

  return (
    <div style={{ padding: 28, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.3 }}>Data</h1>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
            Upload booking history — columns: vehicle, date, price, status
          </div>
        </div>
        {rawBookings.length > 0 && (
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #253BAF, #12086F)',
              border: '1px solid rgba(123,159,255,0.3)',
              borderRadius: 10, color: 'white',
              padding: '9px 18px', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            View Dashboard →
          </button>
        )}
      </div>

      {/* Upload area */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '2px dashed rgba(123,159,255,0.3)',
        borderRadius: 16, padding: 40,
        textAlign: 'center', cursor: 'pointer',
        marginBottom: 24, transition: 'border-color 0.2s',
      }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) {
            const { default: Papa } = require('papaparse')
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: r => handleDataLoaded(r.data.map(row => ({
                vehicle: row.vehicle || row.Vehicle || '',
                date: row.date || row.Date || '',
                price: parseFloat(row.price || row.Price || 0),
                status: row.status || 'completed',
              })))
            })
          }
        }}
        onClick={() => document.getElementById('csv-input').click()}
      >
        <input
          id="csv-input" type="file" accept=".csv"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files[0]
            if (!file) return
            import('papaparse').then(({ default: Papa }) => {
              Papa.parse(file, {
                header: true, skipEmptyLines: true,
                complete: r => handleDataLoaded(r.data.map(row => ({
                  vehicle: row.vehicle || row.Vehicle || '',
                  date: row.date || row.Date || '',
                  price: parseFloat(row.price || row.Price || 0),
                  status: row.status || 'completed',
                })))
              })
            })
          }}
        />
        <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>⊞</div>
        <div style={{ fontSize: 14, color: '#7B9FFF', fontWeight: 500 }}>
          Drop your CSV here or click to upload
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
          Supports .csv files with vehicle, date, price, status columns
        </div>
      </div>

      {/* Data table */}
      {rawBookings.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>
              {rawBookings.length} bookings loaded
            </span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Showing first 20</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['Vehicle', 'Date', 'Price', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: 'left',
                    fontSize: 11, color: '#6B7280', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawBookings.slice(0, 20).map((b, i) => (
                <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 20px', fontSize: 13, color: '#E5E7EB' }}>{b.vehicle}</td>
                  <td style={{ padding: '10px 20px', fontSize: 13, color: '#9CA3AF' }}>{b.date}</td>
                  <td style={{ padding: '10px 20px', fontSize: 13, color: '#7B9FFF', fontWeight: 500 }}>RM {b.price}</td>
                  <td style={{ padding: '10px 20px' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500,
                      background: 'rgba(34,197,94,0.1)', color: '#22C55E',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}