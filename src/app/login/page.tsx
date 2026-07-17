'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login, signup } from '@/modules/auth/auth.actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = mode === 'login' ? await login(formData) : await signup(formData)

    if (result && !result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">AulaDocente</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Inicia sesión para continuar'
              : 'Crea tu cuenta para empezar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Tu nombre" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="docente@ejemplo.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button
                  className="underline hover:text-primary cursor-pointer"
                  onClick={() => setMode('signup')}
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button
                  className="underline hover:text-primary cursor-pointer"
                  onClick={() => setMode('login')}
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
