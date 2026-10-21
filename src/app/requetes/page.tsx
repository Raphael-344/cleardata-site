'use client'
import { useState } from 'react'
import { Play, Loader2, ChevronDown, Database } from 'lucide-react'

const REQUETES = [
  { id: '1', label: 'Liste des agences', desc: 'Toutes les agences régionales avec leurs coordonnées' },
  { id: '2', label: 'Personnel technique Bordeaux', desc: 'Agents techniques de l\'agence de Bordeaux' },
  { id: '3', label: 'Nombre de capteurs', desc: 'Comptage total des capteurs déployés' },
  { id: '4', label: 'Rapports 2018–2022', desc: 'Rapports publiés entre 2018 et 2022' },
  { id: '5', label: 'CH4 en IdF, Bretagne, Occitanie', desc: 'Concentrations méthane en mai-juin 2025' },
  { id: '6', label: 'Agents GESI', desc: 'Techniciens maintenant des capteurs de gaz industriels' },
  { id: '7', label: 'Rapports CO2', desc: 'Rapports concernant le dioxyde de carbone, ordre antichronologique' },
  { id: '8', label: 'Minimum HFC par région', desc: 'Mois de concentration HFC la plus faible' },
  { id: '9', label: 'Moyennes IdF 2025', desc: 'Concentration moyenne par gaz en Île-de-France en 2025' },
  { id: '10', label: 'Productivité admins Toulouse', desc: 'Taux de production de rapports des agents admin' },
  { id: '11', label: 'Rapports par gaz', desc: 'Procédure stockée — rapports pour un gaz donné', hasParam: true },
  { id: '12', label: 'Régions sous-encadrées', desc: 'Régions avec plus de capteurs que de personnel' },
]

const GAZ_OPTIONS = ['Méthane', 'Dioxyde de carbone', 'Protoxyde d\'azote', 'Ozone troposphérique', 'Hydrofluorocarbures', 'Hexafluorure de soufre', 'Ammoniac']

export default function RequetesPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [param, setParam] = useState('Méthane')
  const [customQuery, setCustomQuery] = useState('')
  const [customResult, setCustomResult] = useState<any>(null)
  const [customLoading, setCustomLoading] = useState(false)

  async function runQuery(id: string) {
    setSelected(id)
    setLoading(true)
    setResult(null)
    try {
      const p = id === '11' ? `&param=${encodeURIComponent(param)}` : ''
      const res = await fetch(`/api/requetes?id=${id}${p}`)
      const data = await res.json()
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  // Requête en langage naturel → SQL simple
  async function runCustom() {
    setCustomLoading(true)
    setCustomResult(null)
    const q = customQuery.toLowerCase()
    let sql = ''

    if (q.includes('agence')) sql = 'SELECT * FROM Agence ORDER BY region LIMIT 20'
    else if (q.includes('capteur') && q.includes('actif')) sql = 'SELECT COUNT(*) AS capteurs_actifs FROM CAPTEUR WHERE actif = 1'
    else if (q.includes('capteur')) sql = 'SELECT COUNT(*) AS total_capteurs FROM CAPTEUR'
    else if (q.includes('rapport')) sql = 'SELECT titre, date_rapport FROM RAPPORT ORDER BY date_rapport DESC LIMIT 10'
    else if (q.includes('co2') || q.includes('carbone')) sql = "SELECT ville_capteur, concentration_ppm, date_releve FROM RELEVE r JOIN CAPTEUR c ON r.id_capteur=c.id_capteur WHERE c.sigle='CO2' ORDER BY date_releve DESC LIMIT 20"
    else if (q.includes('ch4') || q.includes('méthane') || q.includes('methane')) sql = "SELECT ville_capteur, concentration_ppm, date_releve FROM RELEVE r JOIN CAPTEUR c ON r.id_capteur=c.id_capteur WHERE c.sigle='CH4' ORDER BY date_releve DESC LIMIT 20"
    else if (q.includes('employe') || q.includes('employé') || q.includes('agent')) sql = 'SELECT nom, prenom FROM EMPLOYE ORDER BY nom LIMIT 20'
    else if (q.includes('region') || q.includes('région')) sql = 'SELECT DISTINCT region FROM Agence ORDER BY region'
    else if (q.includes('gaz')) sql = 'SELECT sigle, nom_gaz, type_gaz FROM GAZ'
    else sql = 'SELECT * FROM GAZ'

    try {
      const res = await fetch('/api/requetes/custom?sql=' + encodeURIComponent(sql))
      if (!res.ok) throw new Error('Requête non supportée')
      const data = await res.json()
      setCustomResult({ ...data, sql })
    } catch {
      setCustomResult({ error: 'Je n\'ai pas compris la demande. Essayez "liste des agences" ou "capteurs actifs".' })
    } finally {
      setCustomLoading(false)
    }
  }

  const cols = result?.rows?.[0] ? Object.keys(result.rows[0]) : []

  return (
    <div className="pt-24 max-w-7xl mx-auto px-6 pb-24">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-air-500/30 bg-air-500/10 text-air-400 text-xs font-mono mb-4">
          <Database size={12} />
          REQUÊTES SQL
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
          12 Requêtes<br /><span className="text-air-400">du cahier des charges</span>
        </h1>
        <p className="text-slate-400 max-w-xl">Exécutez les requêtes en direct sur la base de données. Les années et le gaz des requêtes R05, R07 et R09 sont adaptés aux données disponibles (relevés de mai 2025 à avril 2026).</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Liste requêtes */}
        <div className="space-y-2">
          {REQUETES.map((r) => (
            <div key={r.id}>
              {r.hasParam && (
                <div className="mb-2 px-3">
                  <select value={param} onChange={e => setParam(e.target.value)}
                    className="w-full bg-dark-700 border border-air-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-air-500/50">
                    {GAZ_OPTIONS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              )}
              <button onClick={() => runQuery(r.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200
                  ${selected === r.id
                    ? 'bg-air-500/15 border-air-500/50 text-white'
                    : 'border-air-500/10 hover:border-air-500/30 hover:bg-air-500/5 text-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-air-500 mb-1 block">R{r.id.padStart(2,'0')}</span>
                    <span className="font-medium text-sm">{r.label}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                  </div>
                  {selected === r.id && loading
                    ? <Loader2 size={14} className="text-air-400 animate-spin" />
                    : <Play size={14} className="text-air-500 opacity-60" />}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Résultats */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="glass p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 size={32} className="text-air-400 animate-spin" />
              <p className="text-slate-400">Exécution en cours...</p>
            </div>
          )}

          {result && !loading && (
            <div className="glass overflow-hidden">
              <div className="p-5 border-b border-air-500/10 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg">{result.label}</h3>
                  <p className="text-sm text-air-400 font-mono mt-1">{result.count} résultats</p>
                </div>
              </div>
              {result.rows?.length > 0 ? (
                <div className="overflow-auto max-h-[60vh]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-air-500/10">
                        {cols.map(col => (
                          <th key={col} className="px-4 py-3 text-left text-xs font-mono text-air-400 uppercase tracking-wider whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-air-500/5 hover:bg-air-500/5 transition-colors">
                          {cols.map(col => (
                            <td key={col} className="px-4 py-2.5 text-slate-300 whitespace-nowrap font-mono text-xs">
                              {row[col] instanceof Date
                                ? new Date(row[col]).toLocaleDateString('fr-FR')
                                : String(row[col] ?? '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">Aucun résultat</div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="glass p-12 text-center">
              <Database size={40} className="text-air-500/30 mx-auto mb-4" />
              <p className="text-slate-500">Sélectionnez une requête pour voir les résultats</p>
            </div>
          )}

          {/* Requête libre */}
          <div className="glass mt-6 p-6">
            <h3 className="font-display font-bold mb-1">Requête en langage naturel</h3>
            <p className="text-xs text-slate-500 mb-4">Décrivez ce que vous cherchez en français</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runCustom()}
                placeholder="ex: liste des agences, concentration CO2, rapports récents..."
                className="flex-1 bg-dark-700 border border-air-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-air-500/50 transition-colors"
              />
              <button onClick={runCustom} disabled={customLoading || !customQuery}
                className="px-5 py-3 bg-air-500 hover:bg-air-400 disabled:opacity-40 text-dark-900 font-semibold rounded-xl transition-all flex items-center gap-2">
                {customLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              </button>
            </div>
            {customResult && (
              <div className="mt-4">
                {customResult.sql && (
                  <div className="bg-dark-800 rounded-lg p-3 mb-3 font-mono text-xs text-air-300 border border-air-500/10">
                    {customResult.sql}
                  </div>
                )}
                {customResult.error
                  ? <p className="text-red-400 text-sm">{customResult.error}</p>
                  : <p className="text-air-400 text-sm">{customResult.count} résultats trouvés</p>
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
