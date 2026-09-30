'use client'

import { SessionProvider } from 'next-auth/react'
import { LucideProvider } from 'lucide-react'
import { Toaster } from '@shared/ui'
import { QueryProvider } from './QueryProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LucideProvider strokeWidth={1.5}>
      <SessionProvider>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
      </SessionProvider>
    </LucideProvider>
  )
}
