'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@shared/ui'
import { QueryProvider } from './QueryProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
      <Toaster />
    </SessionProvider>
  )
}
