import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Budget Tracker - Secure Access',
  description: 'Personal Budget Tracker with PIN Protection',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            {children}
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
