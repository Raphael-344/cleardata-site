import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const sigle = searchParams.get('sigle') || null

  if (!q || q.length < 2) return NextResponse.json([])

  try {
    const rows = await query(`
      SELECT 
        c.ville_capteur AS ville,
        a.region,
        g.sigle,
        g.nom_gaz,
        g.type_gaz,
        r.concentration_ppm,
        r.date_releve,
        c.actif
      FROM CAPTEUR c
      JOIN GAZ g ON c.sigle = g.sigle
      JOIN Agence a ON c.id_agence = a.id_agence
      LEFT JOIN (
        SELECT id_capteur, MAX(date_releve) AS max_date
        FROM RELEVE
        GROUP BY id_capteur
      ) m ON m.id_capteur = c.id_capteur
      LEFT JOIN RELEVE r ON r.id_capteur = c.id_capteur AND r.date_releve = m.max_date
      WHERE c.ville_capteur LIKE ?
        ${sigle ? 'AND g.sigle = ?' : ''}
      ORDER BY c.ville_capteur, g.sigle
      LIMIT 50
    `, sigle ? [`${q}%`, sigle] : [`${q}%`])

    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
