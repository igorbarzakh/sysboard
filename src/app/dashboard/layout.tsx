import { DashboardHeader } from '@/widgets/dashboard-header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-canvas">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
