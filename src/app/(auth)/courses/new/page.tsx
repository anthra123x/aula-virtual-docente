'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCourse } from '@/modules/courses/courses.actions'
import { useState } from 'react'

export default function NewCoursePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createCourse(formData)

    if (!result.success) {
      setError(result.error)
    } else {
      router.push('/courses')
      router.refresh()
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nueva materia</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la materia</Label>
              <Input id="name" name="name" placeholder="Ej: Matemáticas 10°" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" name="description" placeholder="Ej: Álgebra y funciones" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" name="color" type="color" defaultValue="#3B82F6" className="h-10 w-20" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit">Crear materia</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
