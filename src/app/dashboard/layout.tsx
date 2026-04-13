import { DashboardHeader } from '@/widgets/dashboard-header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
