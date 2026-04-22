import { useCallback } from 'react'
import Papa from 'papaparse'

export default function CSVUpload({ onDataLoaded }) {
  const handleFile = useCallback((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Auto-map columns — expects: vehicle, date, price, status
        const bookings = results.data.map(row => ({
          vehicle: row.vehicle || row.Vehicle || row.car || '',
          date:    row.date    || row.Date    || row.booking_date || '',
          price:   parseFloat(row.price || row.Price || row.amount || 0),
          status:  row.status  || row.Status  || 'completed',
        }))
        onDataLoaded(bookings)
      },
    })
  }, [onDataLoaded])

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
      style={{
        border: '2px dashed #253BAF', borderRadius: 12,
        padding: 40, textAlign: 'center', cursor: 'pointer',
        background: '#f8f9ff',
      }}
      onClick={() => document.getElementById('csv-input').click()}
    >
      <input
        id="csv-input" type="file" accept=".csv" style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      <div style={{ fontSize: 14, color: '#253BAF', fontWeight: 500 }}>
        Drop your CSV here or click to upload
      </div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
        Needs columns: vehicle, date, price, status
      </div>
    </div>
  )
}