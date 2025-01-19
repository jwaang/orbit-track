import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { cn } from '../lib/utils'

export const metadata: Metadata = {
  title: 'OrbitTrack',
  description: 'Track. Discover. Conquer.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.ico" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
      )}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
