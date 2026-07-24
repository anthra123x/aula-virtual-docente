'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type DeleteButtonProps = {
  action: (id: string) => void | Promise<void>
  id: string
  label?: string
  description?: string
  variant?: 'destructive' | 'outline'
  size?: 'sm' | 'icon-xs'
}

export function DeleteButton({ action, id, label = 'Eliminar', description, variant = 'destructive', size = 'sm' }: DeleteButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await action(id)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={variant} size={size}>
        <Trash2 className={`h-4 w-4 ${size === 'sm' ? 'md:mr-1' : ''}`} />
        {size === 'sm' && <span className="hidden md:inline">{label}</span>}
      </Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar {label.toLowerCase()}?</DialogTitle>
          <DialogDescription>
            {description || 'Esta acción no se puede deshacer. Se eliminarán todos los datos asociados.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
