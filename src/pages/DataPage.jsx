import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { useFleetStore } from '../store/fleetStore'
import { processFleetData, getAvailableMonths, normalizeDate } from '../utils/dataProcessor'
import {
  appendBookings, saveVehicles, getBookings, getVehicles,
  addBooking, updateBooking, deleteBooking,
} from '../utils/firestoreService'
import { auth } from '../firebase'

function mapRow(row) {
  const rawDate = row.date || row.Date || row.booking_date || row.BookingDate || ''
  return {
    vehicle: row.vehicle || row.Vehicle || row.car || row.Car || '',
    date:    normalizeDate(rawDate) || rawDate,
    price:   parseFloat(row.price || row.Price || row.amount || row.Amount || 0),
    status:  row.status || row.Status || 'completed',
  }
}

const EMPTY_BOOKING = { vehicle: '', date: '', price: '', status: 'completed' }

const inputS = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, color: '#E5E7EB',
  padding: '8px 10px', fontSize: 13,
  outline: 'none', width: '100%',
  boxSizing: 'border-box',
}

// ── Reusable custom dropdown ──────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder = 'All', width = 160 }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative', width }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8, color: '#E5E7EB',
          padding: '8px 12px', fontSize: 13,
          fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 8,
        }}
      >
        <span style={{ color: selected ? '#E5E7EB' : '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{
          fontSize: 9, color: '#6B7280', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: '#1a1a35',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, overflow: 'hidden',
          zIndex: 999, minWidth: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          maxHeight: 240, overflowY: 'auto',
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                padding: '9px 14px', fontSize: 13,
                color: opt.value === value ? '#7B9FFF' : '#E5E7EB',
                background: opt.value === value ? 'rgba(123,159,255,0.15)' : 'transparent',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontWeight: opt.value === value ? 600 : 400,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (opt.value !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={e => {
                if (opt.value !== value) e.currentTarget.style.background = 'transparent'
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed: { bg: 'rgba(34,197,94,0.1)',   color: '#22C55E', border: 'rgba(34,197,94,0.2)'   },
    pending:   { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.2)'  },
    cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.2)'   },
  }
  const s = map[status] || map.completed
  return (
    <span style={{
      fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {status}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
export default function DataPage() {
  const navigate  = useNavigate()
  const uid       = auth.currentUser?.uid
  const { hasData, rawBookings, rawVehicles, setRawData, setProcessedData } = useFleetStore()

  const [tab, setTab]               = useState(hasData ? 'records' : 'upload')
  const [allBookings, setAllBookings] = useState(rawBookings)
  const [allVehicles, setAllVehicles] = useState(rawVehicles)

  // Upload
  const [dragging, setDragging]     = useState(false)
  const [preview, setPreview]       = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [uploadMsg, setUploadMsg]   = useState('')

  // Edit / Add
  const [editingId, setEditingId]   = useState(null)
  const [editForm, setEditForm]     = useState({})
  const [adding, setAdding]         = useState(false)
  const [addForm, setAddForm]       = useState(EMPTY_BOOKING)
  const [saving, setSaving]         = useState(false)
  const [fieldError, setFieldError] = useState('')

  // Filters
  const [search, setSearch]           = useState('')
  const [filterVehicle, setFilterVehicle] = useState('all')
  const [filterMonth, setFilterMonth]     = useState('all')

  useEffect(() => {
    setAllBookings(rawBookings)
    setAllVehicles(rawVehicles)
  }, [rawBookings, rawVehicles])

  const recompute = (bookings, vehicles) => {
    setRawData(bookings, vehicles)
    setProcessedData(processFleetData(bookings, vehicles))
  }

  // ── Validate add form ────────────────────────────────────────
  const validateForm = (form) => {
    if (!form.vehicle.trim()) return 'Vehicle name is required.'
    if (!form.date)           return 'Date is required.'
    const normalized = normalizeDate(form.date)
    if (!normalized)          return 'Date must be in DD/MM/YYYY or YYYY-MM-DD format.'
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
      return 'Price must be a number greater than 0.'
    return null
  }

  // ── Add booking ──────────────────────────────────────────────
  const handleAdd = async () => {
    setFieldError('')
    const error = validateForm(addForm)
    if (error) { setFieldError(error); return }

    setSaving(true)
    try {
      const normalized = { ...addForm, date: normalizeDate(addForm.date) || addForm.date, price: parseFloat(addForm.price) }
      const newId = await addBooking(uid, normalized)
      const updated = [...allBookings, { id: newId, ...normalized }]
        .sort((a, b) => a.date.localeCompare(b.date))
      setAllBookings(updated)
      recompute(updated, allVehicles)
      setAdding(false)
      setAddForm(EMPTY_BOOKING)
      setFieldError('')
    } finally { setSaving(false) }
  }

  // ── Edit booking ─────────────────────────────────────────────
  const startEdit = (b) => {
    setEditingId(b.id)
    setEditForm({ vehicle: b.vehicle, date: b.date, price: b.price, status: b.status })
    setFieldError('')
  }

  const saveEdit = async (id) => {
    setFieldError('')
    const error = validateForm(editForm)
    if (error) { setFieldError(error); return }

    setSaving(true)
    try {
      const normalized = { ...editForm, date: normalizeDate(editForm.date) || editForm.date, price: parseFloat(editForm.price) }
      await updateBooking(uid, id, normalized)
      const updated = allBookings.map(b => b.id === id ? { ...b, ...normalized } : b)
      setAllBookings(updated)
      recompute(updated, allVehicles)
      setEditingId(null)
      setFieldError('')
    } finally { setSaving(false) }
  }

  // ── Delete booking ───────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return
    await deleteBooking(uid, id)
    const updated = allBookings.filter(b => b.id !== id)
    setAllBookings(updated)
    recompute(updated, allVehicles)
  }

  // ── CSV upload ───────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file?.name.endsWith('.csv')) { setUploadMsg('Please upload a .csv file'); return }
    setUploadMsg('')
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (r) => {
        const rows = r.data.map(mapRow).filter(b => b.vehicle && b.date)
        if (!rows.length) { setUploadMsg('No valid rows found.'); return }
        setPreview(rows)
      },
    })
  }

  const confirmUpload = async () => {
    if (!preview) return
    setUploading(true)
    try {
      const newModels   = [...new Set(preview.map(b => b.vehicle))]
      const newVehicles = newModels.map(m => ({
        model: m,
        basePrice: Math.round(
          preview.filter(b => b.vehicle === m).reduce((s, b) => s + b.price, 0) /
          preview.filter(b => b.vehicle === m).length
        ),
      }))
      const added = await appendBookings(uid, preview)
      await saveVehicles(uid, newVehicles)
      const [freshBookings, freshVehicles] = await Promise.all([getBookings(uid), getVehicles(uid)])
      setAllBookings(freshBookings)
      setAllVehicles(freshVehicles)
      recompute(freshBookings, freshVehicles)
      setPreview(null)
      setUploadMsg(`✓ ${added} new bookings added. ${preview.length - added} duplicates skipped.`)
      setTab('records')
    } catch (e) {
      setUploadMsg('Error saving. Please try again.')
    } finally { setUploading(false) }
  }

  // ── Filter options ───────────────────────────────────────────
  const availableMonths  = getAvailableMonths(allBookings)
  const uniqueVehicles   = [...new Set(allBookings.map(b => b.vehicle).filter(Boolean))]

  const monthOptions = [
    { value: 'all', label: 'All months' },
    ...availableMonths.map(m => {
      const [y, mon] = m.split('-')
      const label = new Date(parseInt(y), parseInt(mon) - 1)
        .toLocaleString('en-MY', { month: 'long', year: 'numeric' })
      return { value: m, label }
    }),
  ]
  const vehicleOptions = [
    { value: 'all', label: 'All vehicles' },
    ...uniqueVehicles.map(v => ({ value: v, label: v })),
  ]
  const statusOptions = [
    { value: 'completed', label: 'completed' },
    { value: 'pending',   label: 'pending'   },
    { value: 'cancelled', label: 'cancelled' },
  ]

  const filtered = allBookings.filter(b => {
    const matchSearch  = !search || b.vehicle?.toLowerCase().includes(search.toLowerCase()) || b.date?.includes(search)
    const matchVehicle = filterVehicle === 'all' || b.vehicle === filterVehicle
    const matchMonth   = filterMonth   === 'all' || b.date?.startsWith(filterMonth)
    return matchSearch && matchVehicle && matchMonth
  })

  // ── Styles ───────────────────────────────────────────────────
  const tabBtn = (active) => ({
    padding: '9px 20px', borderRadius: 9, border: 'none',
    background: active ? 'rgba(123,159,255,0.2)' : 'transparent',
    color: active ? '#7B9FFF' : '#6B7280',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  })

  const actionBtn = (variant = 'blue') => ({
    background: variant === 'red' ? 'rgba(239,68,68,0.12)' : 'rgba(123,159,255,0.12)',
    border: `1px solid ${variant === 'red' ? 'rgba(239,68,68,0.25)' : 'rgba(123,159,255,0.25)'}`,
    borderRadius: 6,
    color: variant === 'red' ? '#EF4444' : '#7B9FFF',
    padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  })

  return (
    <div style={{ padding: 28, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.3 }}>Data</h1>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
            {allBookings.length} total bookings · {uniqueVehicles.length} vehicles
          </div>
        </div>
        {hasData && (
          <button onClick={() => navigate('/')} style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, color: '#E5E7EB',
            padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            ← Dashboard
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 12, padding: 4, marginBottom: 24,
        width: 'fit-content',
      }}>
        <button style={tabBtn(tab === 'records')} onClick={() => setTab('records')}>
          📋 Records {allBookings.length > 0 && `(${allBookings.length})`}
        </button>
        <button style={tabBtn(tab === 'upload')} onClick={() => setTab('upload')}>
          ⬆ Upload CSV
        </button>
      </div>

      {/* ── RECORDS TAB ─────────────────────────────────────── */}
      {tab === 'records' && (
        <div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              placeholder="Search vehicle or date..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputS, width: 220 }}
            />
            <CustomSelect
              value={filterVehicle}
              onChange={setFilterVehicle}
              options={vehicleOptions}
              placeholder="All vehicles"
              width={160}
            />
            <CustomSelect
              value={filterMonth}
              onChange={setFilterMonth}
              options={monthOptions}
              placeholder="All months"
              width={180}
            />
            <button
              onClick={() => { setAdding(true); setFieldError('') }}
              style={{
                marginLeft: 'auto',
                background: 'linear-gradient(135deg, #253BAF, #12086F)',
                border: '1px solid rgba(123,159,255,0.3)',
                borderRadius: 10, color: 'white',
                padding: '8px 18px', fontSize: 13,
                fontWeight: 500, cursor: 'pointer',
              }}
            >
              + Add booking
            </button>
          </div>

          {/* Field error banner */}
          {fieldError && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '10px 16px',
              color: '#EF4444', fontSize: 13, marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠ {fieldError}
            </div>
          )}

          {/* Add row */}
          {adding && (
            <div style={{
              background: 'rgba(123,159,255,0.06)',
              border: '1px solid rgba(123,159,255,0.2)',
              borderRadius: 12, padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: '#7B9FFF', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                New booking — all fields required
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto auto', gap: 10, alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>
                    Vehicle <span style={{ color: '#EF4444' }}>*</span>
                  </div>
                  <input
                    style={{ ...inputS, borderColor: !addForm.vehicle && fieldError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)' }}
                    placeholder="e.g. Myvi"
                    value={addForm.vehicle}
                    onChange={e => setAddForm(f => ({ ...f, vehicle: e.target.value }))}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>
                    Date <span style={{ color: '#EF4444' }}>*</span>
                    <span style={{ color: '#6B7280', fontWeight: 400, marginLeft: 4 }}>(DD/MM/YYYY)</span>
                  </div>
                  <input
                    style={{ ...inputS, borderColor: !addForm.date && fieldError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)' }}
                    placeholder="e.g. 12/4/2026"
                    value={addForm.date}
                    onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>
                    Price (RM) <span style={{ color: '#EF4444' }}>*</span>
                  </div>
                  <input
                    style={{ ...inputS, borderColor: !addForm.price && fieldError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)' }}
                    type="number" placeholder="0"
                    value={addForm.price}
                    onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Status</div>
                  <CustomSelect
                    value={addForm.status}
                    onChange={v => setAddForm(f => ({ ...f, status: v }))}
                    options={statusOptions}
                    width="100%"
                  />
                </div>
                <button onClick={handleAdd} disabled={saving} style={{
                  background: 'linear-gradient(135deg, #253BAF, #12086F)',
                  border: '1px solid rgba(123,159,255,0.3)',
                  borderRadius: 8, color: 'white',
                  padding: '9px 18px', fontSize: 13,
                  fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                }}>
                  {saving ? '...' : 'Save'}
                </button>
                <button onClick={() => { setAdding(false); setAddForm(EMPTY_BOOKING); setFieldError('') }} style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, color: '#9CA3AF',
                  padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, color: '#6B7280', fontSize: 14,
            }}>
              {allBookings.length === 0
                ? 'No bookings yet. Upload a CSV or add a booking manually.'
                : 'No bookings match your filters.'}
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>
                  {filtered.length} records
                </span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {filterMonth !== 'all'
                    ? monthOptions.find(o => o.value === filterMonth)?.label
                    : 'All time'}
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['Vehicle', 'Date', 'Price', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '10px 20px', textAlign: 'left',
                        fontSize: 11, color: '#6B7280',
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {editingId === b.id ? (
                        <>
                          <td style={{ padding: '8px 12px' }}>
                            <input style={inputS} value={editForm.vehicle}
                              onChange={e => setEditForm(f => ({ ...f, vehicle: e.target.value }))} />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input style={inputS} placeholder="DD/MM/YYYY or YYYY-MM-DD"
                              value={editForm.date}
                              onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input style={inputS} type="number" value={editForm.price}
                              onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} />
                          </td>
                          <td style={{ padding: '8px 12px', minWidth: 140 }}>
                            <CustomSelect
                              value={editForm.status}
                              onChange={v => setEditForm(f => ({ ...f, status: v }))}
                              options={statusOptions}
                              width="100%"
                            />
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => saveEdit(b.id)} disabled={saving} style={actionBtn()}>
                                {saving ? '...' : '✓ Save'}
                              </button>
                              <button onClick={() => { setEditingId(null); setFieldError('') }} style={actionBtn('red')}>
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: '10px 20px', fontSize: 13, color: '#E5E7EB', fontWeight: 500 }}>
                            {b.vehicle}
                          </td>
                          <td style={{ padding: '10px 20px', fontSize: 13, color: '#9CA3AF' }}>
                            {b.date}
                          </td>
                          <td style={{ padding: '10px 20px', fontSize: 13, color: '#7B9FFF', fontWeight: 600 }}>
                            RM {parseFloat(b.price).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 20px' }}>
                            <StatusBadge status={b.status} />
                          </td>
                          <td style={{ padding: '10px 20px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => startEdit(b)} style={actionBtn()}>Edit</button>
                              <button onClick={() => handleDelete(b.id)} style={actionBtn('red')}>Delete</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── UPLOAD TAB ──────────────────────────────────────── */}
      {tab === 'upload' && (
        <div style={{ maxWidth: 560 }}>
          {!preview ? (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                onClick={() => document.getElementById('csv-input').click()}
                style={{
                  background: dragging ? 'rgba(123,159,255,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `2px dashed ${dragging ? '#7B9FFF' : 'rgba(123,159,255,0.25)'}`,
                  borderRadius: 20, padding: '48px 32px',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s', marginBottom: 20,
                }}
              >
                <input id="csv-input" type="file" accept=".csv"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])} />
                <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.5 }}>📂</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', marginBottom: 6 }}>
                  Drop your CSV here
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
                  New bookings are <strong style={{ color: '#7B9FFF' }}>added</strong> to existing data. Duplicates skipped.
                </div>
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #253BAF, #12086F)',
                  border: '1px solid rgba(123,159,255,0.3)',
                  borderRadius: 10, color: 'white',
                  padding: '10px 24px', fontSize: 13, fontWeight: 600,
                }}>
                  Choose CSV file
                </div>
              </div>

              {uploadMsg && (
                <div style={{
                  background: uploadMsg.startsWith('✓') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${uploadMsg.startsWith('✓') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  borderRadius: 10, padding: '12px 16px',
                  color: uploadMsg.startsWith('✓') ? '#22C55E' : '#EF4444',
                  fontSize: 13, marginBottom: 20,
                }}>
                  {uploadMsg}
                </div>
              )}

              {/* Format guide */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 20,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Supported formats
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: 8,
                  padding: '12px 14px', fontFamily: 'monospace',
                  fontSize: 12, color: '#7B9FFF', marginBottom: 12,
                }}>
                  vehicle, date, price, status<br />
                  Myvi, 12/4/2026, 120, completed<br />
                  Axia, 2026-04-03, 75, completed
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.8 }}>
                  Date accepts: <span style={{ color: '#E5E7EB' }}>DD/MM/YYYY</span> or <span style={{ color: '#E5E7EB' }}>YYYY-MM-DD</span>
                </div>
              </div>
            </>
          ) : (
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', marginBottom: 6 }}>
                Preview — {preview.length} rows detected
              </div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>
                Dates have been normalised to YYYY-MM-DD. Duplicates will be skipped automatically.
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, overflow: 'hidden', marginBottom: 20,
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {['Vehicle', 'Date', 'Price', 'Status'].map(h => (
                        <th key={h} style={{
                          padding: '9px 16px', textAlign: 'left',
                          fontSize: 11, color: '#6B7280', fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: 0.5,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((b, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '9px 16px', fontSize: 13, color: '#E5E7EB' }}>{b.vehicle}</td>
                        <td style={{ padding: '9px 16px', fontSize: 13, color: '#9CA3AF' }}>{b.date}</td>
                        <td style={{ padding: '9px 16px', fontSize: 13, color: '#7B9FFF', fontWeight: 600 }}>RM {b.price}</td>
                        <td style={{ padding: '9px 16px' }}><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <div style={{ padding: '10px 16px', fontSize: 12, color: '#6B7280', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    + {preview.length - 10} more rows
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setPreview(null)} style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, color: '#E5E7EB',
                  padding: '11px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>
                  ← Choose different file
                </button>
                <button onClick={confirmUpload} disabled={uploading} style={{
                  flex: 1,
                  background: uploading ? 'rgba(37,59,175,0.4)' : 'linear-gradient(135deg, #253BAF, #12086F)',
                  border: '1px solid rgba(123,159,255,0.3)',
                  borderRadius: 10, color: 'white',
                  padding: '11px 20px', fontSize: 13,
                  fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
                }}>
                  {uploading ? 'Saving...' : `Add ${preview.length} bookings →`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}