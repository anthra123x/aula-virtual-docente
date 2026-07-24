'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { parseExcel, confirmImport } from '@/modules/students/import.actions'
import { Upload, Check, FileSpreadsheet, ArrowLeft } from 'lucide-react'

type ParsedRow = {
  lastName: string
  firstName: string
  email?: string
  phone?: string
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default function ImportStudentsPage({ params }: PageProps) {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [total, setTotal] = useState(0)
  const [groupId, setGroupId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [created, setCreated] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [paramsReady, setParamsReady] = useState(false)

  useEffect(() => {
    params.then((p) => {
      setGroupId(p.id)
      setParamsReady(true)
    })
  }, [params])

  async function handleUpload(formData: FormData) {
    if (!groupId) return
    setError(null)
    setLoading(true)
    formData.set('groupId', groupId)
    const result = await parseExcel(formData)
    if (result.success) {
      setRows(result.data.rows)
      setTotal(result.data.total)
      setGroupName(result.data.groupName)
      setStep('preview')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  async function handleConfirm() {
    setError(null)
    setLoading(true)
    const result = await confirmImport(groupId, rows)
    if (result.success) {
      setCreated(result.data.created)
      setStep('done')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  if (!paramsReady) {
    const shimmer = 'animate-shimmer rounded'
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className={`${shimmer} h-4 w-20`} />
        <div className={`${shimmer} h-6 w-64`} />
        <Card>
          <CardContent className="space-y-4 p-8">
            <div className={`${shimmer} h-40 w-full`} />
            <div className={`${shimmer} h-10 w-32`} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="glass-liquid">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Importación completada</h2>
            <p className="text-muted-foreground">
              Se importaron {created} estudiante{created !== 1 ? 's' : ''} en {groupName}.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.push(`/groups/${groupId}`)}>
                Ver grupo
              </Button>
              <Button onClick={() => { setStep('upload'); setRows([]); setError(null) }}>
                Importar otro archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <h1 className="text-2xl font-bold">Importar estudiantes desde Excel</h1>
        <p className="text-muted-foreground">
          {step === 'upload'
            ? 'Selecciona un archivo Excel (.xlsx o .xls) con los datos de los estudiantes.'
            : `Revisa los datos antes de importar`}
        </p>
      </div>

      {step === 'upload' && (
        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Subir archivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Arrastra un archivo o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos: .xlsx, .xls — La primera fila debe contener los encabezados
                </p>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-4 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                  required
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
                <p className="font-medium">Formato esperado:</p>
                <p className="text-muted-foreground">
                  La primera fila debe tener columnas con nombres como:{' '}
                  <code className="bg-muted px-1 rounded">Apellido</code>,{' '}
                  <code className="bg-muted px-1 rounded">Nombre</code>,{' '}
                  <code className="bg-muted px-1 rounded">Email</code> (opcional)
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={loading || !file}>
                {loading ? 'Analizando archivo...' : 'Vista previa'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <Card className="glass-liquid">
            <CardHeader>
              <CardTitle className="text-base">
                Vista previa — {total} estudiante{total !== 1 ? 's' : ''} detectado{total !== 1 ? 's' : ''}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Grupo: {groupName}</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-2 font-medium">#</th>
                      <th className="text-left px-4 py-2 font-medium">Apellido</th>
                      <th className="text-left px-4 py-2 font-medium">Nombre</th>
                      <th className="text-left px-4 py-2 font-medium">Email</th>
                      <th className="text-left px-4 py-2 font-medium">Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-2">{row.lastName}</td>
                        <td className="px-4 py-2">{row.firstName}</td>
                        <td className="px-4 py-2 text-muted-foreground">{row.email || '—'}</td>
                        <td className="px-4 py-2 text-muted-foreground">{row.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-2 border-t">
                  ... y {rows.length - 10} estudiante{rows.length - 10 !== 1 ? 's' : ''} más
                </p>
              )}
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Volver
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'Importando...' : `Importar ${total} estudiante${total !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
