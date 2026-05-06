import { query } from '@/lib/db'
import { Wind, Activity, MapPin, FileText, Thermometer, Users } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  try {
    const [stats] = await query(`
      SELECT
        (SELECT COUNT(*) FROM Agence) AS agences,
        (SELECT COUNT(*) FROM CAPTEUR) AS capteurs,
        (SELECT COUNT(*) FROM CAPTEUR WHERE actif = 1) AS capteurs_actifs,
        (SELECT COUNT(*) FROM RELEVE) AS releves,
        (SELECT COUNT(*) FROM RAPPORT) AS rapports,
        (SELECT COUNT(*) FROM EMPLOYE) AS employes,
        (SELECT COUNT(DISTINCT region) FROM Agence) AS regions
    `)
    return stats as any
  } catch { return null }
}

async function getLastReleve() {
  try {
    const rows = await query(`
      SELECT r.date_releve, r.concentration_ppm, c.ville_capteur, g.sigle, g.nom_gaz
      FROM RELEVE r
      JOIN CAPTEUR c ON r.id_capteur = c.id_capteur
      JOIN GAZ g ON c.sigle = g.sigle
      ORDER BY r.id_releve DESC LIMIT 6
    `)
    return rows as any[]
  } catch { return [] }
}

const GAZ_COLORS: Record<string, string> = {
  CO2: '#f97316', CH4: '#a855f7', N2O: '#3b82f6',
  O3: '#06b6d4', HFC: '#ec4899', SF6: '#f59e0b', NH3: '#22c55e'
}

export default async function Home() {
  const stats = await getStats()
  const lastReleves = await getLastReleve()

  const statCards = [
    { label: 'Agences régionales', value: stats?.agences?.toLocaleString('fr') ?? '—', icon: MapPin, color: 'air' },
    { label: 'Capteurs déployés', value: stats?.capteurs?.toLocaleString('fr') ?? '—', icon: Activity, color: 'air' },
    { label: 'Capteurs actifs', value: stats?.capteurs_actifs?.toLocaleString('fr') ?? '—', icon: Thermometer, color: 'air' },
    { label: 'Relevés enregistrés', value: stats?.releves?.toLocaleString('fr') ?? '—', icon: Wind, color: 'air' },
    { label: 'Rapports publiés', value: stats?.rapports?.toLocaleString('fr') ?? '—', icon: FileText, color: 'air' },
    { label: 'Agents terrain', value: stats?.employes?.toLocaleString('fr') ?? '—', icon: Users, color: 'air' },
  ]

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden grid-pattern min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/50 to-dark-900" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-air-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-air-400/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-air-500/30 bg-air-500/10 text-air-400 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-air-400 animate-pulse" />
              MINISTÈRE DE LA TRANSITION ÉCOLOGIQUE
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
              Qualité de l'air<br />
              <span className="text-air-400">en France</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              Plateforme nationale de surveillance atmosphérique. Données en temps réel issues de
              <span className="text-air-400"> {stats?.capteurs?.toLocaleString('fr') ?? '244 545'} capteurs</span> répartis
              sur l'ensemble du territoire métropolitain.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/carte"
                className="inline-flex items-center gap-2 px-6 py-3 bg-air-500 hover:bg-air-400 text-dark-900 font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-air-500/30">
                <MapPin size={18} />
                Explorer la carte
              </Link>
              <Link href="/requetes"
                className="inline-flex items-center gap-2 px-6 py-3 border border-air-500/40 hover:border-air-400 text-air-400 hover:text-air-300 rounded-xl transition-all duration-200 hover:bg-air-500/10">
                Lancer une requête
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-px bg-air-500/50" />
          <h2 className="font-display text-2xl font-bold">Vue d'ensemble</h2>
          <div className="flex-1 h-px bg-air-500/10" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map(({ label, value, icon: Icon }, i) => (
            <div key={i} className="stat-card p-5" style={{ animationDelay: `${i * 0.1}s` }}>
              <Icon size={18} className="text-air-400 mb-3 opacity-80" />
              <div className="font-display text-2xl font-bold text-white mb-1">{value}</div>
              <div className="text-xs text-slate-500 leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Derniers relevés */}
      {lastReleves.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-air-500/50" />
            <h2 className="font-display text-2xl font-bold">Derniers relevés</h2>
            <div className="flex-1 h-px bg-air-500/10" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lastReleves.map((r: any, i: number) => (
              <div key={i} className="glass p-5 hover:border-air-500/40 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{r.ville_capteur}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(r.date_releve).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
                    style={{ background: `${GAZ_COLORS[r.sigle]}20`, color: GAZ_COLORS[r.sigle] }}>
                    {r.sigle}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold" style={{ color: GAZ_COLORS[r.sigle] }}>
                    {parseFloat(r.concentration_ppm).toFixed(2)}
                  </span>
                  <span className="text-slate-500 text-sm">ppm</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">{r.nom_gaz}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Navigation cards */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { href: '/carte', title: 'Carte interactive', desc: 'Visualisez les capteurs et concentrations sur une carte de France zoomable.', icon: MapPin },
            { href: '/graphiques', title: 'Graphiques', desc: "Évolution temporelle, comparaisons inter-régions, tendances 2017–2024.", icon: Activity },
            { href: '/requetes', title: '12 Requêtes SQL', desc: 'Toutes les requêtes du cahier des charges avec résultats visuels en direct.', icon: FileText },
          ].map(({ href, title, desc, icon: Icon }) => (
            <Link key={href} href={href}
              className="glass p-8 group hover:border-air-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-air-500/10">
              <div className="w-12 h-12 rounded-xl bg-air-500/10 border border-air-500/20 flex items-center justify-center mb-5 group-hover:bg-air-500/20 transition-all">
                <Icon size={22} className="text-air-400" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              <div className="mt-4 text-air-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Explorer →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
