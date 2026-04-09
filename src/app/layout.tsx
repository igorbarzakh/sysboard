import type { Metadata } from 'next'
import '@/shared/styles/global.css'

export const metadata: Metadata = {
  title: 'System Design Board',
  description: 'Collaborative diagramming tool for software architects',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
