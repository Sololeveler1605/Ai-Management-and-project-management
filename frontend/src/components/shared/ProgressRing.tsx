import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

type ProgressRingProps = {
  pct: number
  color: string
  height?: number
}

/** Admin `_progress_ring` — hole 0.75, track #F1F5F9, center pct + Overall Progress */
export function ProgressRing({ pct, color, height = 190 }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)))
  const data = [
    { name: 'done', value: clamped },
    { name: 'rest', value: 100 - clamped },
  ]

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            stroke="#FFFFFF"
            strokeWidth={2}
            isAnimationActive={false}
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill={color} />
            <Cell fill="#F1F5F9" />
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
          {clamped}%
        </div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>Overall Progress</div>
      </div>
    </div>
  )
}
