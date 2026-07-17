export const dynamic = 'force-dynamic'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { SidebarProvider } from '@/components/layout/SidebarProvider'
import { AgentChat } from '@/components/ai/agent-chat'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <div className="flex h-dvh">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header user={user} />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
        <AgentChat />
      </div>
    </SidebarProvider>
  )
}
