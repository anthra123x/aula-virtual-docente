import { requireAuth } from '@/modules/auth/auth.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Administra tu cuenta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cuenta</CardTitle>
          <CardDescription>
            Has iniciado sesión como <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-10 w-10 rounded-full mb-2" />
          ) : null}
          <p>Nombre: {user.name}</p>
        </CardContent>
      </Card>
    </div>
  )
}
