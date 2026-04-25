export function normalizeDate(raw) {
  if (!raw || typeof raw !== 'string') return null
  raw = raw.trim()

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  // D/M/YYYY or DD/MM/YYYY (e.g. 12/4/2026)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split('/')
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  // D-M-YYYY with dashes
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split('-')
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  return null
}

export function processFleetData(bookings, vehicles, targetMonth = null) {
  const now = new Date()
  const month = targetMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, mon] = month.split('-').map(Number)
  const daysInMonth = new Date(year, mon, 0).getDate()

  // Normalize ALL dates before any filtering
  const normalizedBookings = bookings
    .map(b => ({ ...b, date: normalizeDate(b.date) }))
    .filter(b => b.date !== null)

  // Filter to target month
  const monthBookings = normalizedBookings.filter(b => b.date.startsWith(month))

  // Per-vehicle stats
  const vehicleStats = vehicles.map(v => {
    const vBookings   = monthBookings.filter(b =>
      b.vehicle?.toLowerCase() === v.model?.toLowerCase()
    )
    const uniqueDates = [...new Set(vBookings.map(b => b.date))]
    const bookedDays  = uniqueDates.length
    const revenue     = vBookings.reduce((s, b) => s + (parseFloat(b.price) || 0), 0)
    const utilization = Math.round((bookedDays / daysInMonth) * 100)
    const idleDays    = daysInMonth - bookedDays

    return {
      model: v.model,
      basePrice: v.basePrice || 0,
      utilization,
      revenue,
      idleDays,
      bookedDays,
      bookingCount: vBookings.length,
    }
  })

  // Add vehicles found in bookings but not in vehicles list
  const knownModels = vehicles.map(v => v.model.toLowerCase())
  const extraModels = [...new Set(monthBookings.map(b => b.vehicle))]
    .filter(m => m && !knownModels.includes(m.toLowerCase()))

  extraModels.forEach(m => {
    const vBookings   = monthBookings.filter(b => b.vehicle?.toLowerCase() === m.toLowerCase())
    const uniqueDates = [...new Set(vBookings.map(b => b.date))]
    const bookedDays  = uniqueDates.length
    const revenue     = vBookings.reduce((s, b) => s + (parseFloat(b.price) || 0), 0)
    vehicleStats.push({
      model: m,
      basePrice: Math.round(revenue / (vBookings.length || 1)),
      utilization: Math.round((bookedDays / daysInMonth) * 100),
      revenue,
      idleDays: daysInMonth - bookedDays,
      bookedDays,
      bookingCount: vBookings.length,
    })
  })

  // Summary
  const totalRevenue    = vehicleStats.reduce((s, v) => s + v.revenue, 0)
  const totalBookedDays = vehicleStats.reduce((s, v) => s + v.bookedDays, 0)
  const totalVehicleDays = vehicleStats.length * daysInMonth
  const totalIdleDays   = vehicleStats.reduce((s, v) => s + v.idleDays, 0)

  // Weekday vs weekend
  const weekdayBookings = monthBookings.filter(b => {
    const d = new Date(b.date)
    return d.getDay() >= 1 && d.getDay() <= 5
  })
  const weekendBookings = monthBookings.filter(b => {
    const d = new Date(b.date)
    return d.getDay() === 0 || d.getDay() === 6
  })
  const total = monthBookings.length || 1

  // Daily revenue trend
  const revenueTrend = Array.from({ length: daysInMonth }, (_, i) => {
    const day     = String(i + 1).padStart(2, '0')
    const dateStr = `${month}-${day}`
    const dayRev  = monthBookings
      .filter(b => b.date === dateStr)
      .reduce((s, b) => s + (parseFloat(b.price) || 0), 0)
    return { date: dateStr, day: i + 1, revenue: dayRev }
  })

  return {
    month,
    summary: {
      revenue:        totalRevenue,
      utilization:    totalVehicleDays > 0 ? Math.round((totalBookedDays / totalVehicleDays) * 100) : 0,
      idle_days:      totalIdleDays,
      total_bookings: monthBookings.length,
      days_in_month:  daysInMonth,
    },
    vehicles: vehicleStats,
    trend: {
      weekday:         weekdayBookings.length,
      weekend:         weekendBookings.length,
      weekday_pct:     Math.round((weekdayBookings.length / total) * 100),
      weekend_pct:     Math.round((weekendBookings.length / total) * 100),
      weekday_revenue: weekdayBookings.reduce((s, b) => s + (parseFloat(b.price) || 0), 0),
      weekend_revenue: weekendBookings.reduce((s, b) => s + (parseFloat(b.price) || 0), 0),
    },
    revenueTrend,
  }
}

// Get list of months that have bookings
export function getAvailableMonths(bookings) {
  const months = [...new Set(
    bookings
      .map(b => {
        const normalized = normalizeDate(b.date)
        if (!normalized) return null
        const match = normalized.match(/^(\d{4}-\d{2})/)
        return match ? match[1] : null
      })
      .filter(Boolean)
  )].sort().reverse()
  return months
}