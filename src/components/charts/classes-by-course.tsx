'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type Props = {
  data: { name: string; classes: number }[]
}

const COLORS = [
  'oklch(0.48 0.035 265)',
  'oklch(0.55 0.04 265)',
  'oklch(0.5 0.06 30)',
  'oklch(0.52 0.05 220)',
  'oklch(0.5 0.08 100)',
  'oklch(0.45 0.06 300)',
]

export function ClassesByCourseChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No hay datos de materias
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(48, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid stroke="oklch(0 0 0 / 0.04)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={data.reduce((max, d) => Math.max(max, d.name.length * 8), 80)}
        />
        <Tooltip
          cursor={{ fill: 'oklch(0 0 0 / 0.03)' }}
          contentStyle={{
            background: 'oklch(0.17 0.012 263)',
            border: '1px solid oklch(0.22 0.01 260)',
            borderRadius: '8px',
            fontSize: '13px',
          }}
        />
        <Bar dataKey="classes" radius={[0, 6, 6, 0]} barSize={20}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
