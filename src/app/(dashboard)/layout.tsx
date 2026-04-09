import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { DashboardHeader } from '@/widgets/dashboard-header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/sign-in')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DashboardHeader />
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
