import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function getColor(utilization) {
  if (utilization >= 75) return "#4F6BFF";   // softer blue
  if (utilization >= 55) return "#22C55E";   // green
  if (utilization >= 40) return "#F59E0B";   // amber
  return "#EF4444";                          // red
}

export default function UtilizationChart({ data }) {
  if (!data) return null;

  const chartData = data.vehicles.map(v => ({
    name: v.model,
    utilization: v.utilization,
  }));

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.1)",
        padding: 18,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 16,
          color: "#E5E7EB",
          letterSpacing: 0.3,
        }}
      >
        Vehicle Utilization
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={28}>
          
          {/* subtle grid */}
          <CartesianGrid
            stroke="rgba(255,255,255,0.08)"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={[0, 100]}
            tickFormatter={v => `${v}%`}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={v => [`${v}%`, "Utilization"]}
            contentStyle={{
              background: "rgba(17,24,39,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
            labelStyle={{ color: "#9CA3AF" }}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />

          <Bar dataKey="utilization" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.utilization)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* modern legend */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        {[
          ["#4F6BFF", "High"],
          ["#22C55E", "Good"],
          ["#F59E0B", "Medium"],
          ["#EF4444", "Low"],
        ].map(([c, l]) => (
          <span
            key={l}
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c,
                boxShadow: `0 0 6px ${c}`,
              }}
            />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}