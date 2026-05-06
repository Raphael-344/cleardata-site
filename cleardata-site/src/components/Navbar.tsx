'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wind, Map, BarChart3, Search, Database, Info } from 'lucide-react'

const links = [
  { href: '/', label: 'Accueil', icon: Wind },
  { href: '/carte', label: 'Carte', icon: Map },
  { href: '/graphiques', label: 'Graphiques', icon: BarChart3 },
  { href: '/requetes', label: 'Requêtes', icon: Database },
  { href: '/recherche', label: 'Recherche', icon: Search },
  { href: '/about', label: 'À propos', icon: Info },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-air-900/50"
      style={{ background: 'rgba(5,10,6,0.92)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-air-500/20 border border-air-500/40 flex items-center justify-center group-hover:bg-air-500/30 transition-all">
            <Wind size={16} className="text-air-400" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Clear<span className="text-air-400">Data</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-air-500/20 text-air-400 border border-air-500/30'
                    : 'text-slate-400 hover:text-air-300 hover:bg-air-500/10'
                  }`}>
                <Icon size={14} />
                <span className="hidden md:block">{label}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-air-400 animate-pulse" />
          <span className="text-xs text-air-400 font-mono">LIVE</span>
        </div>
      </div>
    </nav>
  )
}
