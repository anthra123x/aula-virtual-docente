'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { login, signup } from '@/modules/auth/auth.actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err === 'oauth_failed') setError('Error al iniciar sesión con Google')
    else if (err === 'no_code') setError('Error de autenticación: código no recibido')
    else if (err && err !== 'google_denied') setError(err)
  }, [])

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

    const result = mode === 'login' ? await login(formData) : await signup(formData)

    if (result && !result.success) {
      setError(result.error)
    }
    setLoading(false)
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
        <CardContent className="space-y-4">
          <Button
            render={<a href="/api/auth/google-login" />}
            variant="outline"
            className="w-full"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              o
            </span>
          </div>

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
