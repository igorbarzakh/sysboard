import { DashboardHeader } from '@/widgets/dashboard-header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DashboardHeader />
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
