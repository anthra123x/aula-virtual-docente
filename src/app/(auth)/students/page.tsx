import { requireAuth } from '@/modules/auth/auth.actions'

export default async function StudentsPage() {
  await requireAuth()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estudiantes</h1>
      <p className="text-muted-foreground">Selecciona un grupo para ver sus estudiantes</p>
    </div>
  )
}
