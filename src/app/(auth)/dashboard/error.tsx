'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
      </div>
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-destructive font-medium">Error al cargar el dashboard</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={reset} variant="outline" size="sm">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
