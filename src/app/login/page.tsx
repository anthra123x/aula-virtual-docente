'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      const password = formData.get('password') as string
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        setLoading(false)
        return
      }
    }

    if (mode === 'login') {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        setLoading(false)
        return
      }
      window.location.href = '/dashboard'
      return
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Error al crear cuenta')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md glass-liquid-animated">
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
        <CardContent className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? (mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...')
                : (mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta')}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
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
