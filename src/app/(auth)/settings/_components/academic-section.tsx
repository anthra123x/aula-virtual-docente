'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateSettings } from '@/modules/settings/settings.actions'
import { CalendarDays, GraduationCap, Save, Building2 } from 'lucide-react'
import Link from 'next/link'

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: '31/12/2025' },
  { value: 'MM/DD/YYYY', label: '12/31/2025' },
  { value: 'YYYY-MM-DD', label: '2025-12-31' },
]

type Props = {
  schoolName: string
  defaultYear: string
  dateFormat: string
}

export function AcademicSection({ schoolName, defaultYear, dateFormat }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    setSaving(true)
    const result = await updateSettings(formData)
    if (!result.success) {
      setError(result.error)
      setSaving(false)
    } else {
      setSuccess(true)
      setSaving(false)
      router.refresh()
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  return (
    <Card className="glass-liquid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Configuración académica
        </CardTitle>
        <CardDescription>Información institucional y preferencias del año escolar</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              Nombre de la institución
            </Label>
            <Input
              id="schoolName"
              name="schoolName"
              defaultValue={schoolName}
              placeholder="Ej: Colegio San José"
            />
            <p className="text-xs text-muted-foreground">
              Se usará en reportes y vistas generales
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultYear" className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Año por defecto
              </Label>
              <Input
                id="defaultYear"
                name="defaultYear"
                type="number"
                defaultValue={defaultYear}
                min={2020}
                max={2100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat" className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Formato de fecha
              </Label>
              <select
                id="dateFormat"
                name="dateFormat"
                defaultValue={dateFormat}
                className="w-full h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {DATE_FORMATS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Label className="text-sm text-muted-foreground block mb-2">Períodos académicos</Label>
            <Button render={<Link href="/periods" />} variant="outline" size="sm">
              <CalendarDays className="h-4 w-4 mr-1" />
              Gestionar períodos
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">Configuración guardada</p>}

          <Button type="submit" disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
