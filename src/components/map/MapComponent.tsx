'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

let cityCoords: Record<string, [number, number]> = {}
let coordsLoaded = false

async function loadCoords() {
  if (coordsLoaded) return
  try {
    const res = await fetch('/city_coords.json')
    cityCoords = await res.json()
    coordsLoaded = true
  } catch {
    coordsLoaded = true
  }
}

function getCoords(ville: string): [number, number] | null {
  return cityCoords[ville] || null
}

interface Props {
  data: any[]
  sigle: string
  color: string
  minVal: number
  maxVal: number
}

export default function MapComponent({ data, sigle, color, minVal, maxVal }: Props) {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    loadCoords()
    import('leaflet').then(L => {
      if (mapInstanceRef.current) return
      const map = L.map(mapRef.current!, {
        center: [46.5, 2.5],
        zoom: 6,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
      })
      // Clé CARTO Basemaps obligatoire depuis septembre 2026 (sinon tuiles avec filigrane)
      const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY
      L.tileLayer(`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoKey ? `?key=${cartoKey}` : ''}`, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map)
      mapInstanceRef.current = map
    })
    return () => { mapInstanceRef.current?.remove(); mapInstanceRef.current = null }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !data.length) return
    const render = async () => {
      await loadCoords()
      import('leaflet').then(L => {
        if (markersRef.current) {
          markersRef.current.clearLayers()
          mapInstanceRef.current.removeLayer(markersRef.current)
        }
        const layer = L.layerGroup()
        let placed = 0
        const r = parseInt(color.slice(1,3),16)
        const g = parseInt(color.slice(3,5),16)
        const b = parseInt(color.slice(5,7),16)
        data.forEach((d: any) => {
          const coords = getCoords(d.ville)
          if (!coords) return
          const val = parseFloat(d.concentration)
          const t = maxVal > minVal ? (val - minVal) / (maxVal - minVal) : 0.5
          const circle = L.circleMarker(coords, {
            radius: 3 + t * 8,
            fillColor: `rgb(${r},${g},${b})`,
            fillOpacity: 0.25 + t * 0.65,
            color: `rgb(${r},${g},${b})`,
            weight: 0.5, opacity: 0.5,
          })
          circle.bindPopup(`<div style="font-family:monospace;min-width:150px;">
            <div style="font-size:13px;font-weight:bold;color:${color};margin-bottom:4px;">${d.ville}</div>
            <div style="color:#94a3b8;font-size:10px;">${d.region}</div>
            <div style="margin-top:6px;"><span style="color:${color};font-size:18px;font-weight:bold;">${val.toFixed(3)}</span><span style="color:#64748b;font-size:10px;"> ppm</span></div>
            <div style="color:#64748b;font-size:9px;margin-top:2px;">${sigle}</div>
          </div>`, { maxWidth: 200 })
          layer.addLayer(circle)
          placed++
        })
        layer.addTo(mapInstanceRef.current)
        markersRef.current = layer
        setCount(placed)
      })
    }
    render()
  }, [data, color, minVal, maxVal, sigle])

  function flyToCity() {
    if (!search || !mapInstanceRef.current) return
    const found = data.find((d: any) => d.ville.toLowerCase().startsWith(search.toLowerCase()))
    if (found) {
      const coords = getCoords(found.ville)
      if (coords) { mapInstanceRef.current.flyTo(coords, 12, { duration: 1.2 }); setSelected(found) }
    }
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <div className="flex items-center glass overflow-hidden">
          <Search size={14} className="text-slate-400 ml-3" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && flyToCity()}
            placeholder="Rechercher une ville..."
            className="bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none w-48" />
          {search && <button onClick={() => { setSearch(''); setSelected(null) }} className="pr-3"><X size={12} className="text-slate-500" /></button>}
        </div>
        <button onClick={flyToCity} className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: color, color: '#050a06' }}>Go</button>
      </div>
      {selected && (
        <div className="absolute top-4 left-4 z-[1000] glass p-4 min-w-[200px]">
          <div className="font-display font-bold text-lg" style={{ color }}>{selected.ville}</div>
          <div className="text-xs text-slate-500 mb-2">{selected.region}</div>
          <div><span className="font-display text-3xl font-bold" style={{ color }}>{parseFloat(selected.concentration).toFixed(3)}</span><span className="text-slate-400 text-sm"> ppm</span></div>
          <div className="text-xs text-slate-600 mt-1">{sigle}</div>
        </div>
      )}
      <div className="absolute bottom-6 left-4 z-[1000] glass p-4 min-w-[180px]">
        <div className="text-xs font-mono text-slate-400 mb-2">{sigle} — {count.toLocaleString('fr')} villes</div>
        <div className="w-full h-2 rounded-full mb-1" style={{ background: `linear-gradient(to right, ${color}33, ${color})` }} />
        <div className="flex justify-between text-xs font-mono text-slate-500"><span>{minVal.toFixed(3)}</span><span>{maxVal.toFixed(3)}</span></div>
      </div>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
