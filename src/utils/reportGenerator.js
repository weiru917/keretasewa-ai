import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function generateReport(processedData, recommendations) {
  // Build a hidden HTML report div, capture it, save as PDF
  const container = document.createElement('div')
  container.id = 'pdf-report-container'
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 794px;
    background: #0d0d1f;
    font-family: 'Inter', system-ui, sans-serif;
    color: #E5E7EB;
    padding: 0;
    z-index: -1;
  `
  container.innerHTML = buildReportHTML(processedData, recommendations)
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0d0d1f',
      width: 794,
      windowWidth: 794,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth  = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth   = pageWidth
    const imgHeight  = (canvas.height * pageWidth) / canvas.width

    let heightLeft = imgHeight
    let position   = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add extra pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const date = new Date().toISOString().split('T')[0]
    pdf.save(`KeretaSewa-Report-${date}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}

function buildReportHTML(data, recommendations) {
  const { summary, vehicles, trend } = data
  const date = new Date().toLocaleDateString('en-MY', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const gain = recommendations
    ? recommendations.reduce((sum, r) => {
        return sum + parseInt((r.impact?.revenue || '0').replace(/[^0-9]/g, ''))
      }, 0)
    : 1140

  const utilizationBars = vehicles.map(v => {
    const color = v.utilization >= 75 ? '#4F6BFF'
      : v.utilization >= 55 ? '#22C55E'
      : v.utilization >= 40 ? '#F59E0B'
      : '#EF4444'
    return `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px">
          <span style="font-size:13px;color:#E5E7EB;font-weight:500">${v.model}</span>
          <span style="font-size:13px;color:${color};font-weight:700">${v.utilization}%</span>
        </div>
        <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${v.utilization}%;background:${color};border-radius:4px"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span style="font-size:11px;color:#6B7280">RM ${v.revenue.toLocaleString()} revenue</span>
          <span style="font-size:11px;color:#6B7280">${v.idleDays} idle days</span>
        </div>
      </div>
    `
  }).join('')

  const recCards = (recommendations || []).map((r, i) => {
    const confColor = r.confidence === 'High' ? '#22C55E' : '#F59E0B'
    const confBg    = r.confidence === 'High' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)'
    return `
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);border-radius:12px;padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;letter-spacing:0.5px">
            Recommendation ${i + 1}
          </span>
          <span style="font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600;
            background:${confBg};color:${confColor};border:1px solid ${confColor}44">
            ${r.confidence} confidence
          </span>
        </div>
        <div style="font-size:14px;font-weight:600;color:#FFFFFF;margin-bottom:6px">${r.action}</div>
        <div style="font-size:12px;color:#9CA3AF;margin-bottom:10px;line-height:1.6">${r.reasoning}</div>
        ${r.tradeoff ? `<div style="font-size:11px;color:#6B7280;margin-bottom:10px;font-style:italic">Trade-off: ${r.tradeoff}</div>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${r.impact?.revenue ? `<span style="background:rgba(79,107,255,0.15);border:1px solid rgba(79,107,255,0.3);border-radius:6px;padding:4px 10px;font-size:11px;color:#7B9FFF;font-weight:600">${r.impact.revenue}/mo</span>` : ''}
          ${r.impact?.bookings ? `<span style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:6px;padding:4px 10px;font-size:11px;color:#22C55E;font-weight:600">${r.impact.bookings} bookings</span>` : ''}
          ${r.impact?.utilization ? `<span style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:6px;padding:4px 10px;font-size:11px;color:#F59E0B;font-weight:600">${r.impact.utilization} util</span>` : ''}
        </div>
      </div>
    `
  }).join('')

  const vehicleTableRows = vehicles.map(v => `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#E5E7EB;font-weight:500;border-bottom:1px solid rgba(255,255,255,0.05)">${v.model}</td>
      <td style="padding:10px 16px;font-size:13px;color:#9CA3AF;border-bottom:1px solid rgba(255,255,255,0.05)">${v.bookedDays} / 30 days</td>
      <td style="padding:10px 16px;font-size:13px;font-weight:700;color:${v.utilization >= 55 ? '#22C55E' : v.utilization >= 40 ? '#F59E0B' : '#EF4444'};border-bottom:1px solid rgba(255,255,255,0.05)">${v.utilization}%</td>
      <td style="padding:10px 16px;font-size:13px;color:#7B9FFF;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.05)">RM ${v.revenue.toLocaleString()}</td>
      <td style="padding:10px 16px;font-size:13px;color:#6B7280;border-bottom:1px solid rgba(255,255,255,0.05)">${v.idleDays} days</td>
    </tr>
  `).join('')

  return `
    <div style="background:#0d0d1f;min-height:100%;padding:48px 48px 60px">

      <!-- HEADER -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,0.08)">
        <div>
          <div style="font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px">
            Kereta<span style="color:#7B9FFF">Sewa</span> AI
          </div>
          <div style="font-size:13px;color:#6B7280;margin-top:4px">Fleet Performance Report</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;color:#6B7280">Generated on</div>
          <div style="font-size:14px;color:#9CA3AF;font-weight:500;margin-top:2px">${date}</div>
        </div>
      </div>

      <!-- SUMMARY METRICS -->
      <div style="margin-bottom:32px">
        <div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px">
          Executive Summary
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          ${[
            { label: 'Monthly Revenue',   value: `RM ${summary.revenue.toLocaleString()}`, color: '#7B9FFF' },
            { label: 'Fleet Utilization', value: `${summary.utilization}%`,                color: '#22C55E' },
            { label: 'Idle Days',         value: `${summary.idle_days}`,                   color: '#EF4444' },
            { label: 'Total Bookings',    value: `${summary.total_bookings}`,              color: '#F59E0B' },
          ].map(m => `
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;border-top:2px solid ${m.color}">
              <div style="font-size:11px;color:#9CA3AF;margin-bottom:8px;font-weight:500">${m.label}</div>
              <div style="font-size:22px;font-weight:700;color:${m.color}">${m.value}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PROJECTED IMPACT -->
      <div style="background:rgba(123,159,255,0.08);border:1px solid rgba(123,159,255,0.2);border-radius:14px;padding:20px 24px;margin-bottom:32px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px">Current Revenue</div>
          <div style="font-size:20px;font-weight:700;color:#E5E7EB">RM ${summary.revenue.toLocaleString()}</div>
        </div>
        <div style="font-size:20px;color:rgba(255,255,255,0.2)">→</div>
        <div>
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px">Projected Revenue</div>
          <div style="font-size:20px;font-weight:700;color:#7B9FFF">RM ${(summary.revenue + gain).toLocaleString()}</div>
        </div>
        <div style="font-size:20px;color:rgba(255,255,255,0.2)">→</div>
        <div>
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px">Net Gain / Month</div>
          <div style="font-size:20px;font-weight:700;color:#22C55E">+RM ${(gain - 299).toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px">Idle Days Saved</div>
          <div style="font-size:20px;font-weight:700;color:#F59E0B">-16 days</div>
        </div>
      </div>

      <!-- VEHICLE TABLE -->
      <div style="margin-bottom:32px">
        <div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px">
          Vehicle Breakdown
        </div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:rgba(255,255,255,0.04)">
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Vehicle</th>
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Booked Days</th>
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Utilization</th>
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Revenue</th>
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Idle Days</th>
              </tr>
            </thead>
            <tbody>${vehicleTableRows}</tbody>
          </table>
        </div>
      </div>

      <!-- UTILIZATION BARS -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px">
        <div>
          <div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px">
            Utilization by Vehicle
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px">
            ${utilizationBars}
          </div>
        </div>
        <div>
          <div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px">
            Booking Distribution
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px">
            <div style="margin-bottom:16px">
              <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                <span style="font-size:13px;color:#E5E7EB">Weekday bookings</span>
                <span style="font-size:13px;color:#4F6BFF;font-weight:700">${trend.weekday_pct}%</span>
              </div>
              <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px">
                <div style="height:100%;width:${trend.weekday_pct}%;background:#4F6BFF;border-radius:4px"></div>
              </div>
            </div>
            <div style="margin-bottom:24px">
              <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                <span style="font-size:13px;color:#E5E7EB">Weekend bookings</span>
                <span style="font-size:13px;color:#7B9FFF;font-weight:700">${trend.weekend_pct}%</span>
              </div>
              <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px">
                <div style="height:100%;width:${trend.weekend_pct}%;background:#7B9FFF;border-radius:4px"></div>
              </div>
            </div>
            <div style="background:rgba(123,159,255,0.08);border:1px solid rgba(123,159,255,0.2);border-radius:8px;padding:12px">
              <div style="font-size:12px;color:#7B9FFF;font-weight:500">Insight</div>
              <div style="font-size:12px;color:#9CA3AF;margin-top:4px;line-height:1.5">
                Weekend demand is ${trend.weekend_pct > trend.weekday_pct ? 'higher' : 'lower'} than weekday.
                ${trend.weekday_pct < 45 ? 'Consider weekday pricing promotions to boost utilization.' : 'Weekday demand is healthy.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI RECOMMENDATIONS -->
      ${recommendations && recommendations.length > 0 ? `
        <div style="margin-bottom:32px">
          <div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px">
            AI Recommendations
          </div>
          ${recCards}
        </div>
      ` : ''}

      <!-- FOOTER -->
      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:11px;color:#4B5563">
          Generated by KeretaSewa AI · Decision Intelligence for Car Rental Operators
        </div>
        <div style="font-size:11px;color:#4B5563">${date}</div>
      </div>

    </div>
  `
}