'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type Props = {
  data: { name: string; value: number }[]
}

const COLORS: Record<string, string> = {
  PRESENTE: 'oklch(0.5 0.1 145)',
  AUSENTE: 'oklch(0.52 0.14 27)',
  TARDE: 'oklch(0.6 0.12 80)',
}

function label(name: string): string {
  if (name === 'PRESENT') return 'Presente'
  if (name === 'ABSENT') return 'Ausente'
  if (name === 'LATE') return 'Tarde'
  return name
}

export function AttendanceDistribution({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin registros de asistencia
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-36 h-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={52}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || 'oklch(0.5 0.02 250)'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'oklch(0.17 0.012 263)',
                border: '1px solid oklch(0.22 0.01 260)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 text-xs">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: COLORS[entry.name] || 'oklch(0.5 0.02 250)' }}
            />
            <span className="text-muted-foreground">{label(entry.name)}</span>
            <span className="font-medium tabular-nums">{Math.round((entry.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
