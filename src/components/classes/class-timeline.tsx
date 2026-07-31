import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type TimelineClass = {
  id: string
  topic: string
  date: Date
  status: 'PLANNED' | 'DONE' | 'CANCELLED'
  _count: { attendanceRecords: number }
}

const dotColors: Record<string, string> = {
  DONE: 'bg-green-500',
  PLANNED: 'bg-blue-500',
  CANCELLED: 'bg-red-400',
}

const labelColors: Record<string, string> = {
  DONE: 'text-green-600 dark:text-green-400',
  PLANNED: 'text-blue-600 dark:text-blue-400',
  CANCELLED: 'text-red-500 dark:text-red-400',
}

export function ClassTimeline({ classes, currentId }: { classes: TimelineClass[]; currentId: string }) {
  return (
    <ol className="relative border-l border-border/60 ml-2 space-y-4">
      {classes.map((c) => (
        <li key={c.id} className="ml-4">
          <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${dotColors[c.status]}`} />
          <Link href={`/classes/${c.id}`} className="block group">
            <div className="flex items-baseline justify-between gap-2">
              <p className={`text-sm font-medium truncate ${c.id === currentId ? 'text-primary' : 'group-hover:text-foreground text-foreground/90'}`}>
                {c.topic}
              </p>
              <span className={`text-xs shrink-0 ${labelColors[c.status]}`}>
                {c.status === 'DONE' ? 'Realizada' : c.status === 'CANCELLED' ? 'Cancelada' : 'Planificada'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(c.date), "EEE d 'de' MMM", { locale: es })}
              {c.status === 'DONE' && ` · ${c._count.attendanceRecords} asistencias`}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  )
}
