import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, DM_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300','400','500','600'],
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400','500'],
})

export const metadata: Metadata = {
  title: 'COLACheck — TTB Label Compliance',
  description: 'Instant TTB beverage alcohol label compliance checks against 27 CFR regulations.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable} ${dmMono.variable}`}>
      <body className="bg-white text-navy antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
