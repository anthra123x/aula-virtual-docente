'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createPeriod } from '@/modules/periods/periods.actions'

export default function NewPeriodPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createPeriod(formData)

    if (!result.success) {
      setError(result.error)
    } else {
      router.push('/periods')
      router.refresh()
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo período académico</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del período</Label>
              <Input id="name" name="name" placeholder="Ej: Bimestre I" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de inicio</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de fin</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input id="year" name="year" type="number" defaultValue="2025" required />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit">Crear período</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
