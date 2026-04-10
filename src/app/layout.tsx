import type { Metadata } from 'next'
import './globals.css'
import '@/shared/styles/global.css'
import { NextAuthSessionProvider } from './session-provider'

export const metadata: Metadata = {
  title: 'System Design Board',
  description: 'Collaborative diagramming tool for software architects',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  )
}
