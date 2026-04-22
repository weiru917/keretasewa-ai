export function processFleetData(bookings, vehicles) {
  const TOTAL_DAYS = 30

  const vehicleStats = vehicles.map(v => {
    const vBookings = bookings.filter(b => b.vehicle === v.model)
    const bookedDays = vBookings.length
    const revenue = vBookings.reduce((sum, b) => sum + b.price, 0)
    const utilization = Math.round((bookedDays / TOTAL_DAYS) * 100)
    const idleDays = TOTAL_DAYS - bookedDays

    return {
      model: v.model,
      basePrice: v.basePrice,
      utilization,   // %
      revenue,       // RM
      idleDays,
      bookedDays,
    }
  })

  const totalRevenue = vehicleStats.reduce((s, v) => s + v.revenue, 0)
  const totalBookedDays = vehicleStats.reduce((s, v) => s + v.bookedDays, 0)
  const totalVehicleDays = vehicles.length * TOTAL_DAYS

  // Weekday vs weekend split
  const weekdayBookings = bookings.filter(b => {
    const day = new Date(b.date).getDay()
    return day >= 1 && day <= 5
  }).length
  const weekendBookings = bookings.length - weekdayBookings

  return {
    summary: {
      revenue: totalRevenue,
      utilization: Math.round((totalBookedDays / totalVehicleDays) * 100),
      idle_days: totalVehicleDays - totalBookedDays,
      total_bookings: bookings.length,
    },
    vehicles: vehicleStats,
    trend: {
      weekday: weekdayBookings,
      weekend: weekendBookings,
      weekday_pct: Math.round((weekdayBookings / bookings.length) * 100) || 0,
      weekend_pct: Math.round((weekendBookings / bookings.length) * 100) || 0,
    },
  }
}