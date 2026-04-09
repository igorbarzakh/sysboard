import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--bg-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  )
}
