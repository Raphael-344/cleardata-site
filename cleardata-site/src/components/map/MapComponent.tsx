'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

// Coordonnées approximatives des villes françaises les plus connues
const CITY_COORDS: Record<string, [number, number]> = {
  'Paris': [48.8566, 2.3522], 'Lyon': [45.7640, 4.8357], 'Marseille': [43.2965, 5.3698],
  'Toulouse': [43.6047, 1.4442], 'Nice': [43.7102, 7.2620], 'Nantes': [47.2184, -1.5536],
  'Strasbourg': [48.5734, 7.7521], 'Montpellier': [43.6108, 3.8767], 'Bordeaux': [44.8378, -0.5792],
  'Lille': [50.6292, 3.0573], 'Rennes': [48.1173, -1.6778], 'Reims': [49.2583, 4.0317],
  'Saint-Étienne': [45.4397, 4.3872], 'Toulon': [43.1242, 5.9280], 'Grenoble': [45.1885, 5.7245],
  'Dijon': [47.3220, 5.0415], 'Nîmes': [43.8367, 4.3601], 'Angers': [47.4784, -0.5632],
  'Villeurbanne': [45.7676, 4.8796], 'Le Mans': [48.0061, 0.1996],
  'Aix-en-Provence': [43.5297, 5.4474], 'Clermont-Ferrand': [45.7797, 3.0863],
  'Brest': [48.3905, -4.4860], 'Tours': [47.3941, 0.6848], 'Amiens': [49.8941, 2.2958],
  'Limoges': [45.8336, 1.2611], 'Metz': [49.1193, 6.1757], 'Caen': [49.1829, -0.3707],
  'Nancy': [48.6921, 6.1844], 'Perpignan': [42.6887, 2.8948],
}

// Générer des coords aléatoires en France pour les villes inconnues
function getFranceCoords(seed: string): [number, number] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const lat = 43.5 + (Math.abs(hash % 1000) / 1000) * 7.5
  const lng = -4.5 + (Math.abs((hash >> 10) % 1000) / 1000) * 13
  return [lat, lng]
}

function getCoords(ville: string): [number, number] {
  return CITY_COORDS[ville] || getFranceCoords(ville)
}

function getColor(val: number, min: number, max: number, hex: string): string {
  const t = max > min ? (val - min) / (max - min) : 0.5
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `rgba(${r},${g},${b},${0.3 + t * 0.7})`
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    import('leaflet').then(L => {
      if (mapInstanceRef.current) return

      const map = L.map(mapRef.current!, {
        center: [46.5, 2.5],
        zoom: 6,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !data.length) return
    import('leaflet').then(L => {
      if (markersRef.current) {
        markersRef.current.clearLayers()
      } else {
        markersRef.current = L.layerGroup().addTo(mapInstanceRef.current)
      }

      data.forEach((d: any) => {
        const coords = getCoords(d.ville)
        const val = parseFloat(d.concentration)
        const t = maxVal > minVal ? (val - minVal) / (maxVal - minVal) : 0.5
        const radius = 4 + t * 10

        const circle = L.circleMarker(coords, {
          radius,
          fillColor: color,
          fillOpacity: 0.3 + t * 0.5,
          color: color,
          weight: 1,
          opacity: 0.6,
        })

        circle.bindPopup(`
          <div style="font-family: monospace; min-width: 160px;">
            <div style="font-size: 14px; font-weight: bold; color: ${color}; margin-bottom: 6px;">${d.ville}</div>
            <div style="color: #94a3b8; font-size: 11px;">${d.region}</div>
            <div style="margin-top: 8px;">
              <span style="color: ${color}; font-size: 20px; font-weight: bold;">${val.toFixed(3)}</span>
              <span style="color: #64748b; font-size: 11px;"> ppm</span>
            </div>
            <div style="color: #64748b; font-size: 10px; margin-top: 4px;">${sigle}</div>
          </div>
        `)

        circle.addTo(markersRef.current)
      })
    })
  }, [data, color, minVal, maxVal, sigle])

  function flyToCity() {
    if (!search || !mapInstanceRef.current) return
    const found = data.find((d: any) => d.ville.toLowerCase().includes(search.toLowerCase()))
    if (found) {
      const coords = getCoords(found.ville)
      mapInstanceRef.current.flyTo(coords, 10, { duration: 1.5 })
      setSelected(found)
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Barre de recherche */}
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <div className="flex items-center glass overflow-hidden">
          <Search size={14} className="text-slate-400 ml-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && flyToCity()}
            placeholder="Rechercher une ville..."
            className="bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none w-48"
          />
          {search && (
            <button onClick={() => { setSearch(''); setSelected(null) }} className="pr-3">
              <X size={12} className="text-slate-500" />
            </button>
          )}
        </div>
        <button onClick={flyToCity}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: color, color: '#050a06' }}>
          Go
        </button>
      </div>

      {/* Info ville sélectionnée */}
      {selected && (
        <div className="absolute top-4 left-4 z-[1000] glass p-4 min-w-[200px]">
          <div className="font-display font-bold text-lg" style={{ color }}>{selected.ville}</div>
          <div className="text-xs text-slate-500 mb-2">{selected.region}</div>
          <div>
            <span className="font-display text-3xl font-bold" style={{ color }}>
              {parseFloat(selected.concentration).toFixed(3)}
            </span>
            <span className="text-slate-400 text-sm"> ppm</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">{sigle}</div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
