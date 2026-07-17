'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createGroup } from '@/modules/groups/groups.actions'
import { useState, useEffect } from 'react'

export default function NewGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId: string }>
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [courseId, setCourseId] = useState<string>('')

  useEffect(() => {
    searchParams.then((p) => setCourseId(p.courseId))
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createGroup(formData)

    if (!result.success) {
      setError(result.error)
    } else {
      router.push(`/courses/${courseId}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {courseId && <input type="hidden" name="courseId" value={courseId} />}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del grupo</Label>
              <Input id="name" name="name" placeholder="Ej: 10-1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grado (opcional)</Label>
              <Input id="grade" name="grade" placeholder="Ej: 10°" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit">Crear grupo</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
