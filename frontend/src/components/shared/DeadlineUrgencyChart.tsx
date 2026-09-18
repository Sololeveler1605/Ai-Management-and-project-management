import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ClientDashboardItem } from '../../types/api'
import { CHART_COLORS, daysLeft, isCompleted } from '../../lib/helpers'

type DeadlineUrgencyChartProps = {
  dashboards: ClientDashboardItem[]
  height?: number
}

/** Client `_deadline_urgency_chart` — vertical bars, color-coded */
export function DeadlineUrgencyChart({ dashboards, height = 280 }: DeadlineUrgencyChartProps) {
  const daysValues = dashboards.map((d) => {
    let days = daysLeft(d.deadline)
    days = days !== null ? days : 0
    if (isCompleted(d) && days < 0) days = 0
    return days
  })

  const data = dashboards.map((d, i) => {
    const days = daysValues[i]
    let color: string = CHART_COLORS.green
    if (isCompleted(d)) color = CHART_COLORS.green
    else if (days < 0) color = CHART_COLORS.red
    else if (days <= 7) color = CHART_COLORS.amber
    else color = CHART_COLORS.green

    let label = `${days}d left`
    if (isCompleted(d)) label = 'Completed'
    else if (days < 0) label = `${days}d overdue`

    return {
      name: d.project_name,
      days,
      label,
      color,
    }
  })

  const minVal = Math.min(...daysValues, 0)
  const maxVal = Math.max(...daysValues, 1)
  const padding = Math.max(3, Math.trunc((maxVal - minVal) * 0.3))

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#374151', fontSize: 13 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            domain={[minVal - padding, maxVal + padding]}
            tick={{ fill: '#374151', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Days left', angle: -90, position: 'insideLeft', fill: '#374151' }}
          />
          <Tooltip
            formatter={(v: number | string, _n, item) => [
              String((item?.payload as { label?: string })?.label ?? v),
              'Deadline',
            ]}
            contentStyle={{ borderRadius: 8, borderColor: '#E5E7EB' }}
          />
          <Bar dataKey="days" maxBarSize={48} radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="#FFFFFF" strokeWidth={1} />
            ))}
            <LabelList dataKey="label" position="top" style={{ fill: '#374151', fontSize: 13 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
