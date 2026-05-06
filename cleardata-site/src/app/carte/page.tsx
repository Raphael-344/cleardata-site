'use client'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Calendar, Loader2 } from 'lucide-react'

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-dark-900">
    <Loader2 className="text-air-400 animate-spin" size={32} />
  </div>
)})

const GAZ = ['CO2','CH4','N2O','O3','HFC','SF6','NH3']
const GAZ_LABELS: Record<string,string> = {
  CO2:'Dioxyde de carbone', CH4:'Méthane', N2O:'Protoxyde d\'azote',
  O3:'Ozone', HFC:'Hydrofluorocarbures', SF6:'Hexafluorure de soufre', NH3:'Ammoniac'
}
const GAZ_COLORS: Record<string,string> = {
  CO2:'#f97316',CH4:'#a855f7',N2O:'#3b82f6',O3:'#06b6d4',HFC:'#ec4899',SF6:'#f59e0b',NH3:'#22c55e'
}

export default function CartePage() {
  const [sigle, setSigle] = useState('CO2')
  const [date, setDate] = useState('')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [actualDate, setActualDate] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const d = date ? `&date=${date}` : ''
      const res = await fetch(`/api/carte?sigle=${sigle}${d}`)
      const json = await res.json()
      setData(json.rows || [])
      setActualDate(json.date || '')
    } finally {
      setLoading(false)
    }
  }, [sigle, date])

  useEffect(() => { loadData() }, [loadData])

  const minVal = data.length ? Math.min(...data.map((d:any) => parseFloat(d.concentration))) : 0
  const maxVal = data.length ? Math.max(...data.map((d:any) => parseFloat(d.concentration))) : 1

  return (
    <div className="pt-16 h-screen flex flex-col">
      {/* Header barre */}
      <div className="flex-shrink-0 border-b border-air-500/10 bg-dark-900/90 backdrop-blur px-6 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-air-400" />
          <span className="font-display font-bold text-sm">Carte de France</span>
        </div>

        {/* Sélecteur gaz */}
        <div className="flex gap-1.5">
          {GAZ.map(g => (
            <button key={g} onClick={() => setSigle(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all
                ${sigle === g ? 'text-dark-900 scale-105' : 'text-slate-400 border border-slate-700/50 hover:border-slate-500'}`}
              style={sigle === g ? { background: GAZ_COLORS[g] } : {}}>
              {g}
            </button>
          ))}
        </div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-500" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            min="2017-01-01" max="2024-12-01"
            className="bg-dark-700 border border-air-500/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-air-500/50" />
          {date && <button onClick={() => setDate('')} className="text-xs text-slate-500 hover:text-slate-300">Dernier</button>}
        </div>

        {/* Info */}
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          {loading && <Loader2 size={12} className="animate-spin text-air-400" />}
          {actualDate && <span className="font-mono">{new Date(actualDate).toLocaleDateString('fr-FR', { month:'long', year:'numeric' })}</span>}
          <span className="text-air-400 font-mono">{data.length} villes</span>
        </div>
      </div>

      {/* Carte */}
      <div className="flex-1 relative">
        <MapComponent data={data} sigle={sigle} color={GAZ_COLORS[sigle]} minVal={minVal} maxVal={maxVal} />

        {/* Légende */}
        <div className="absolute bottom-6 left-6 z-[1000] glass p-4 min-w-[180px]">
          <div className="text-xs font-mono text-slate-400 mb-2">{GAZ_LABELS[sigle]} (ppm)</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-full h-2 rounded-full" style={{
              background: `linear-gradient(to right, ${GAZ_COLORS[sigle]}33, ${GAZ_COLORS[sigle]})`
            }} />
          </div>
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span>{minVal.toFixed(3)}</span>
            <span>{maxVal.toFixed(3)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
