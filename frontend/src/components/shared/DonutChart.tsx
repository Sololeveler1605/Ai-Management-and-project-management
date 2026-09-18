import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

type DonutChartProps = {
  labels: string[]
  values: number[]
  colors: string[]
  centerLine1: string
  centerLine2: string
  height?: number
}

/** Recharts port of admin `_donut` — hole 0.68, white stroke, center labels */
export function DonutChart({
  labels,
  values,
  colors,
  centerLine1,
  centerLine2,
  height = 230,
}: DonutChartProps) {
  const data = labels.map((name, i) => ({ name, value: values[i] ?? 0 }))

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="100%"
            stroke="#FFFFFF"
            strokeWidth={3}
            isAnimationActive={false}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i] || '#6B7280'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
          {centerLine1}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>{centerLine2}</div>
      </div>
    </div>
  )
}
