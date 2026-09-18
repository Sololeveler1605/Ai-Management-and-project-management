import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ClientDashboardItem } from '../../types/api'
import { CHART_COLORS, docExt } from '../../lib/helpers'

type DocTypePieChartProps = {
  dashboards: ClientDashboardItem[]
  height?: number
}

/** Client `_doc_type_pie` — hole 0.6 */
export function DocTypePieChart({ dashboards, height = 260 }: DocTypePieChartProps) {
  const extCounts: Record<string, number> = {}
  for (const d of dashboards) {
    for (const doc of d.documents || []) {
      const ext = (docExt(doc.filename) || 'other').toUpperCase()
      extCounts[ext] = (extCounts[ext] || 0) + 1
    }
  }

  const entries = Object.entries(extCounts)
  if (!entries.length) return null

  const palette = [
    CHART_COLORS.indigo,
    CHART_COLORS.teal,
    CHART_COLORS.amber,
    CHART_COLORS.pink,
    CHART_COLORS.violet,
    '#06B6D4',
  ]
  const total = entries.reduce((s, [, v]) => s + v, 0)
  const data = entries.map(([name, value], i) => ({
    name,
    value,
    fill: palette[i % palette.length],
  }))

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
            innerRadius="60%"
            outerRadius="90%"
            stroke="#FFFFFF"
            strokeWidth={3}
            label={({ percent }) => `${Math.round((percent || 0) * 100)}%`}
            labelLine={false}
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#E5E7EB' }} />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ color: CHART_COLORS.text, fontSize: 11 }}
          />
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
          paddingBottom: 28,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
          {total}
        </div>
        <div style={{ fontSize: 11, color: '#6B7280' }}>Total Docs</div>
      </div>
    </div>
  )
}
