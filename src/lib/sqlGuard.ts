// Garde-fou applicatif pour les requêtes SQL libres envoyées à /api/requetes/custom :
// une seule instruction SELECT, sur une liste fermée de tables, avec LIMIT et timeout imposés.

export const TABLES_AUTORISEES = ['Agence', 'CAPTEUR', 'GAZ', 'RELEVE', 'RAPPORT', 'EMPLOYE']
export const LIMIT_MAX = 100
export const TIMEOUT_MS = 5000
const LONGUEUR_MAX = 2000

const MOTS_INTERDITS = [
  'INTO', 'OUTFILE', 'DUMPFILE', 'LOAD_FILE', 'SLEEP', 'BENCHMARK', 'GET_LOCK',
  'FOR UPDATE', 'LOCK IN SHARE MODE', 'UNION', 'INFORMATION_SCHEMA', 'PERFORMANCE_SCHEMA',
  'MYSQL', 'METRICS_SCHEMA', 'DATABASE', 'USER', 'CURRENT_USER', 'SESSION_USER', 'SYSTEM_USER',
  'VERSION', 'CONNECTION_ID',
]

const tablesAutorisees = new Set(TABLES_AUTORISEES.map(t => t.toLowerCase()))

// Fin d'une liste de tables après FROM / JOIN
const FIN_CLAUSE = /\b(?:WHERE|JOIN|INNER|LEFT|RIGHT|CROSS|NATURAL|STRAIGHT_JOIN|ON|USING|GROUP|ORDER|HAVING|LIMIT|WINDOW)\b|[()]/i

export type ResultatValidation = { ok: true; sql: string } | { ok: false; erreur: string }

export function securiserSelect(brut: string): ResultatValidation {
  let sql = brut.trim().replace(/;\s*$/, '')

  if (!sql) return { ok: false, erreur: 'SQL manquant' }
  if (sql.length > LONGUEUR_MAX) return { ok: false, erreur: `Requête trop longue (${LONGUEUR_MAX} caractères max)` }
  if (!/^SELECT\s/i.test(sql)) return { ok: false, erreur: 'Seules les requêtes SELECT sont autorisées' }

  // Les chaînes littérales sont neutralisées pour analyser la structure, les mots-clés et les tables
  const sansChaines = sql.replace(/'(?:[^'\\]|\\.|'')*'|"(?:[^"\\]|\\.)*"/g, "''")
  if (/["\\]/.test(sansChaines) || /'/.test(sansChaines.replace(/''/g, ''))) {
    return { ok: false, erreur: 'Chaîne de caractères mal fermée' }
  }
  if (sansChaines.includes(';')) return { ok: false, erreur: 'Une seule instruction autorisée' }
  if (/--|#|\/\*/.test(sansChaines)) return { ok: false, erreur: 'Commentaires SQL non autorisés' }

  const majuscules = sansChaines.toUpperCase()
  for (const mot of MOTS_INTERDITS) {
    if (new RegExp(`\\b${mot.replace(/ /g, '\\s+')}\\b`).test(majuscules)) {
      return { ok: false, erreur: `Mot-clé non autorisé : ${mot}` }
    }
  }
  if (/@/.test(sansChaines)) return { ok: false, erreur: 'Variables non autorisées' }

  // Chaque FROM / JOIN est analysé séparément (sous-requêtes comprises) : les tables citées,
  // y compris dans une liste séparée par des virgules, doivent appartenir à la liste blanche.
  let tablesTrouvees = 0
  const motsFromJoin = /\b(?:FROM|JOIN)\b/gi
  let m: RegExpExecArray | null
  while ((m = motsFromJoin.exec(sansChaines)) !== null) {
    const suite = sansChaines.slice(m.index + m[0].length)
    const fin = suite.search(FIN_CLAUSE)
    const clause = fin === -1 ? suite : suite.slice(0, fin)
    for (const element of clause.split(',')) {
      const nom = element.trim().split(/\s+/)[0]?.replace(/`/g, '')
      if (!nom) continue // FROM ( sous-requête ) : ses propres FROM sont vérifiés
      if (nom.includes('.') || !tablesAutorisees.has(nom.toLowerCase())) {
        return { ok: false, erreur: `Table non autorisée : ${nom}. Tables disponibles : ${TABLES_AUTORISEES.join(', ')}` }
      }
      tablesTrouvees++
    }
  }
  if (tablesTrouvees === 0) return { ok: false, erreur: `La requête doit porter sur une table : ${TABLES_AUTORISEES.join(', ')}` }

  // LIMIT final plafonné, ou ajouté s'il est absent
  const limitFinal = /\bLIMIT\s+(\d+)(?:\s*(,|OFFSET)\s*(\d+))?\s*$/i.exec(sql)
  if (limitFinal) {
    const [complet, a, separateur, b] = limitFinal
    const debut = sql.slice(0, sql.length - complet.length)
    if (separateur === ',') sql = `${debut}LIMIT ${a}, ${Math.min(Number(b), LIMIT_MAX)}`
    else sql = `${debut}LIMIT ${Math.min(Number(a), LIMIT_MAX)}${b ? ` OFFSET ${b}` : ''}`
  } else {
    sql = `${sql} LIMIT ${LIMIT_MAX}`
  }

  // Timeout côté serveur (hint TiDB / MySQL), en plus du timeout côté client mysql2
  sql = sql.replace(/^SELECT\s/i, `SELECT /*+ MAX_EXECUTION_TIME(${TIMEOUT_MS}) */ `)

  return { ok: true, sql }
}
