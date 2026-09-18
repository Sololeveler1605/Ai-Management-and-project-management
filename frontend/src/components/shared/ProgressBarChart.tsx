import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts'
import type { ClientDashboardItem } from '../../types/api'
import { CHART_COLORS, effectiveProgress, statusMeta } from '../../lib/helpers'

type ProgressBarChartProps = {
  dashboards: ClientDashboardItem[]
  height?: number
}

/** Client `_progress_bar_chart` — spline-like line; Start anchor if 1 project */
export function ProgressBarChart({ dashboards, height }: ProgressBarChartProps) {
  let names = dashboards.map((d) => d.project_name)
  let values = dashboards.map((d) => effectiveProgress(d))
  let colors = dashboards.map((d) => statusMeta(d.status).hex)

  if (dashboards.length === 1) {
    names = ['Start', ...names]
    values = [0, ...values]
    colors = ['#E5E7EB', ...colors]
  }

  const data = names.map((name, i) => ({
    name,
    value: values[i],
    fill: colors[i],
    label: dashboards.length === 1 && i === 0 ? '' : `${values[i]}%`,
  }))

  const chartHeight = height ?? Math.max(240, 70 * Math.max(dashboards.length, 1))

  return (
    <div style={{ width: '100%', height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 50, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#374151', fontSize: 13 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 115]}
            tick={{ fill: '#374151', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Progress %', angle: -90, position: 'insideLeft', fill: '#374151' }}
          />
          <Tooltip
            formatter={(v: number | string) => [`${v}%`, 'Progress']}
            contentStyle={{ borderRadius: 8, borderColor: '#E5E7EB' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.blue}
            strokeWidth={4}
            dot={(props) => {
              const { cx, cy, index } = props
              if (cx == null || cy == null) return <g />
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill={colors[index ?? 0]}
                  stroke="#FFFFFF"
                  strokeWidth={3}
                />
              )
            }}
            activeDot={{ r: 9 }}
          >
            <LabelList
              dataKey="label"
              position="top"
              style={{ fill: CHART_COLORS.text, fontSize: 13 }}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
