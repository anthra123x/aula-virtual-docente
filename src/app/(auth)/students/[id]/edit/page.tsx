'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStudentById, updateStudent } from '@/modules/students/students.actions'

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditStudentPage({ params }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getStudentById(p.id)
      if (result.success) {
        const student = result.data as { firstName: string; lastName: string; email?: string | null; phone?: string | null }
        setFirstName(student.firstName)
        setLastName(student.lastName)
        setEmail(student.email || '')
        setPhone(student.phone || '')
      }
      setLoading(false)
    })
  }, [params])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await updateStudent(id, formData)

    if (!result.success) {
      setError(result.error)
    } else {
      router.push(`/students/${id}`)
      router.refresh()
    }
  }

  if (loading) return null

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar estudiante</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico (opcional)</Label>
              <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
