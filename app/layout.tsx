import type { Metadata } from 'next'
import { Outfit, Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300','400','500','600','700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400','500','600'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400','500'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-label',
  display: 'swap',
  weight: ['400','500','600'],
})

export const metadata: Metadata = {
  title: 'COLACheck — TTB Label Pre-Screening',
  description: 'Check your beverage alcohol label against federal TTB labeling requirements in 27 CFR before you file. Every finding cited to the regulation behind it.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrains.variable} ${cormorant.variable}`}>
      <body className="bg-ground font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
