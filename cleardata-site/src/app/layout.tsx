import type { Metadata } from 'next'
import { Syne, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const syne = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['400','600','700','800'] })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','500','600'] })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500'] })

export const metadata: Metadata = {
  title: 'ClearData — Qualité de l\'air en France',
  description: 'Plateforme nationale de surveillance de la qualité de l\'air — Ministère de la Transition Écologique',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="bg-dark-900 text-white font-body antialiased">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
