'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Activity, Wind } from 'lucide-react'

const GAZ = ['Tous','CO2','CH4','N2O','O3','HFC','SF6','NH3']
const GAZ_COLORS: Record<string,string> = {
  CO2:'#f97316',CH4:'#a855f7',N2O:'#3b82f6',O3:'#06b6d4',HFC:'#ec4899',SF6:'#f59e0b',NH3:'#22c55e'
}

export default function RecherchePage() {
  const [q, setQ] = useState('')
  const [sigle, setSigle] = useState('Tous')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<any>(null)

  useEffect(() => {
    clearTimeout(timer.current)
    if (q.length < 2) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const s = sigle !== 'Tous' ? `&sigle=${sigle}` : ''
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}${s}`)
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } finally { setLoading(false) }
    }, 300)
  }, [q, sigle])

  // Grouper par ville
  const byVille: Record<string, any[]> = {}
  results.forEach((r: any) => {
    if (!byVille[r.ville]) byVille[r.ville] = []
    byVille[r.ville].push(r)
  })

  return (
    <div className="pt-24 max-w-5xl mx-auto px-6 pb-24">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-air-500/30 bg-air-500/10 text-air-400 text-xs font-mono mb-4">
          <Search size={12} />
          RECHERCHE
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
          Rechercher<br /><span className="text-air-400">une ville</span>
        </h1>
      </div>

      {/* Barre de recherche */}
      <div className="glass p-6 mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 flex items-center gap-3 bg-dark-800 border border-air-500/20 rounded-xl px-4 py-3 focus-within:border-air-500/50 transition-colors">
            <Search size={18} className="text-slate-500" />
            <input type="text" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Nom de ville... (ex: Paris, Lyon, Toulouse)"
              autoFocus
              className="flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none text-lg" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {GAZ.map(g => (
            <button key={g} onClick={() => setSigle(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all
                ${sigle === g
                  ? g === 'Tous' ? 'bg-air-500 text-dark-900' : 'text-dark-900'
                  : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}
              style={sigle === g && g !== 'Tous' ? { background: GAZ_COLORS[g] } : {}}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Résultats */}
      {q.length >= 2 && (
        <div>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Recherche...</div>
          ) : Object.keys(byVille).length === 0 ? (
            <div className="text-center py-12 text-slate-500">Aucune ville trouvée pour "{q}"</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byVille).map(([ville, capteurs]) => (
                <div key={ville} className="glass p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-air-500/10 border border-air-500/20 flex items-center justify-center">
                      <MapPin size={16} className="text-air-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl">{ville}</h3>
                      <p className="text-xs text-slate-500">{capteurs[0].region}</p>
                    </div>
                    <span className="ml-auto text-xs font-mono text-air-400 border border-air-500/20 px-2 py-1 rounded">
                      {capteurs.length} capteur{capteurs.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {capteurs.map((c: any, i: number) => (
                      <div key={i} className="bg-dark-800/50 rounded-xl p-4 border border-air-500/10 hover:border-air-500/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: `${GAZ_COLORS[c.sigle]}20`, color: GAZ_COLORS[c.sigle] }}>
                            {c.sigle}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${c.actif ? 'bg-air-400' : 'bg-slate-600'}`} />
                        </div>
                        {c.concentration_ppm ? (
                          <>
                            <div className="font-display text-2xl font-bold mt-2" style={{ color: GAZ_COLORS[c.sigle] }}>
                              {parseFloat(c.concentration_ppm).toFixed(3)}
                            </div>
                            <div className="text-xs text-slate-500">ppm</div>
                            <div className="text-xs text-slate-600 mt-1">
                              {c.date_releve ? new Date(c.date_releve).toLocaleDateString('fr-FR', { month:'short', year:'numeric' }) : '—'}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-slate-600 mt-2">Pas de données</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {q.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <Wind size={48} className="mx-auto mb-4 opacity-30" />
          <p>Tapez le nom d'une ville pour voir ses données de qualité de l'air</p>
        </div>
      )}
    </div>
  )
}
