import type { ZodError } from 'zod'

export function formVal(formData: FormData, name: string): string {
  return (formData.get(name) as string) || ''
}

export function formatZodError(error: ZodError): string {
  return error.issues
    .map((e) => {
      const msg = e.message
      if (msg.startsWith('Invalid input:')) {
        return 'Valor inválido para ' + e.path.join('.')
      }
      return msg
    })
    .join(', ')
}
