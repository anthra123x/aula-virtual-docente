import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type Props = {
  doneCount: number
  plannedCount: number
  periodName?: string | null
}

export function PeriodProgress({ doneCount, plannedCount, periodName }: Props) {
  const total = doneCount + plannedCount
  if (total === 0) return null

  const pct = Math.round((doneCount / total) * 100)

  return (
    <Card className="glass-liquid">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span>Avance del período {periodName ? `· ${periodName}` : ''}</span>
          <span className="tabular-nums">{pct}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={pct} />
        <p className="text-xs text-muted-foreground">
          {doneCount} clase{doneCount === 1 ? '' : 's'} realizada{doneCount === 1 ? '' : 's'} de {total} en el grupo
        </p>
      </CardContent>
    </Card>
  )
}
