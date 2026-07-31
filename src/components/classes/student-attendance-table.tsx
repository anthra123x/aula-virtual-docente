import { CheckCircle2, XCircle, Clock, MinusCircle } from 'lucide-react'

type StudentRow = {
  id: string
  firstName: string
  lastName: string
  currentStatus: 'PRESENT' | 'ABSENT' | 'LATE' | null
  history: { present: number; absent: number; late: number }
}

const statusMeta: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  PRESENT: { label: 'Presente', icon: CheckCircle2, className: 'text-green-600 dark:text-green-400' },
  ABSENT: { label: 'Ausente', icon: XCircle, className: 'text-red-600 dark:text-red-400' },
  LATE: { label: 'Tardanza', icon: Clock, className: 'text-amber-600 dark:text-amber-400' },
}

export function StudentAttendanceTable({ students }: { students: StudentRow[] }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
            <th className="py-2 pr-2 font-medium">Estudiante</th>
            <th className="py-2 px-2 font-medium text-center">En esta clase</th>
            <th className="py-2 px-2 font-medium text-center">Histórico (P / T / A)</th>
            <th className="py-2 pl-2 font-medium text-right">Asistencia</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const total = s.history.present + s.history.absent + s.history.late
            const pct = total > 0 ? Math.round(((s.history.present + s.history.late) / total) * 100) : null
            const meta = s.currentStatus ? statusMeta[s.currentStatus] : null
            const Icon = meta?.icon

            return (
              <tr key={s.id} className="border-b border-border/40 last:border-0">
                <td className="py-2 pr-2">
                  {s.lastName}, {s.firstName}
                </td>
                <td className="py-2 px-2 text-center">
                  {meta ? (
                    <span className={`inline-flex items-center gap-1 ${meta.className}`}>
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {meta.label}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <MinusCircle className="h-3.5 w-3.5" />
                      Sin registro
                    </span>
                  )}
                </td>
                <td className="py-2 px-2 text-center tabular-nums text-muted-foreground">
                  {total > 0 ? (
                    <>
                      <span className="text-green-600 dark:text-green-400">{s.history.present}</span>
                      {' / '}
                      <span className="text-amber-600 dark:text-amber-400">{s.history.late}</span>
                      {' / '}
                      <span className="text-red-600 dark:text-red-400">{s.history.absent}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-2 pl-2 text-right tabular-nums">
                  {pct !== null ? (
                    <span className={pct >= 75 ? 'text-green-600 dark:text-green-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                      {pct}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
