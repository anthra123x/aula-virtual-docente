'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type SidebarContext = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContext>({
  open: false,
  setOpen: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <SidebarContext value={{ open, setOpen }}>
      {children}
    </SidebarContext>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
