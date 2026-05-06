'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { BarChart3, TrendingUp, Globe } from 'lucide-react'

const GAZ = ['CO2','CH4','N2O','O3','HFC','SF6','NH3']
const REGIONS = ['Île-de-France','Auvergne-Rhône-Alpes','Nouvelle-Aquitaine','Occitanie','Hauts-de-France','Grand Est','Bretagne','Normandie','Pays de la Loire','Centre-Val de Loire','Bourgogne-Franche-Comté',"Provence-Alpes-Côte d'Azur",'Corse']
const GAZ_COLORS: Record<string,string> = { CO2:'#f97316',CH4:'#a855f7',N2O:'#3b82f6',O3:'#06b6d4',HFC:'#ec4899',SF6:'#f59e0b',NH3:'#22c55e' }

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

function formatData(rows: any[]) {
  return rows.map((r: any) => ({
    ...r,
    label: `${MOIS[(r.mois||1)-1]} ${r.annee}`,
    moyenne: parseFloat(r.moyenne)
  }))
}

export default function GraphiquesPage() {
  const [sigle, setSigle] = useState('CO2')
  const [region, setRegion] = useState('Île-de-France')
  const [evolution, setEvolution] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [gaz, setGaz] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/graphiques?type=evolution&sigle=${sigle}&region=${encodeURIComponent(region)}`).then(r=>r.json()),
      fetch(`/api/graphiques?type=regions&sigle=${sigle}`).then(r=>r.json()),
      fetch(`/api/graphiques?type=gaz&region=${encodeURIComponent(region)}`).then(r=>r.json()),
    ]).then(([ev, reg, g]) => {
      setEvolution(formatData(ev))
      setRegions(reg.map((r:any) => ({ ...r, moyenne: parseFloat(r.moyenne) })))
      setGaz(g.map((r:any) => ({ ...r, moyenne: parseFloat(r.moyenne) })))
    }).finally(() => setLoading(false))
  }, [sigle, region])

  return (
    <div className="pt-24 max-w-7xl mx-auto px-6 pb-24">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-air-500/30 bg-air-500/10 text-air-400 text-xs font-mono mb-4">
          <BarChart3 size={12} />
          VISUALISATION
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
          Graphiques<br /><span className="text-air-400">& Tendances</span>
        </h1>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-10">
        <div>
          <label className="text-xs text-slate-500 font-mono mb-1.5 block">GAZ</label>
          <div className="flex gap-2 flex-wrap">
            {GAZ.map(g => (
              <button key={g} onClick={() => setSigle(g)}
                className={`px-4 py-2 rounded-lg text-sm font-mono font-bold transition-all
                  ${sigle === g ? 'text-dark-900' : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}
                style={sigle === g ? { background: GAZ_COLORS[g] } : {}}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-mono mb-1.5 block">RÉGION</label>
          <select value={region} onChange={e => setRegion(e.target.value)}
            className="bg-dark-700 border border-air-500/20 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-air-500/50">
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Évolution temporelle */}
        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-air-400" />
            <h2 className="font-display font-bold text-lg">Évolution 2017–2024 — {sigle} en {region}</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} interval={11} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0a1a0c', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#e2e8f0' }}
                formatter={(v: any) => [`${parseFloat(v).toFixed(4)} ppm`, sigle]} />
              <Line type="monotone" dataKey="moyenne" stroke={GAZ_COLORS[sigle]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Comparaison régions */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={18} className="text-air-400" />
              <h2 className="font-display font-bold text-lg">Comparaison régions — {sigle} (2024)</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="region" tick={{ fill: '#94a3b8', fontSize: 9 }} width={120} />
                <Tooltip contentStyle={{ background: '#0a1a0c', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#e2e8f0' }} />
                <Bar dataKey="moyenne" fill={GAZ_COLORS[sigle]} radius={[0,4,4,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tous les gaz en région */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={18} className="text-air-400" />
              <h2 className="font-display font-bold text-lg">Tous les gaz — {region} (2024)</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gaz}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
                <XAxis dataKey="sigle" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0a1a0c', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#e2e8f0' }}
                  formatter={(v: any, _: any, props: any) => [`${parseFloat(v).toFixed(4)} ppm`, props.payload.nom_gaz]} />
                <Bar dataKey="moyenne" radius={[4,4,0,0]}>
                  {gaz.map((entry: any) => (
                    <rect key={entry.sigle} fill={GAZ_COLORS[entry.sigle] || '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
