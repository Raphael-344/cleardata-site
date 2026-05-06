import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const sigle = searchParams.get('sigle') || 'CO2'

  try {
    // Si pas de date, prendre le dernier relevé disponible
    let targetDate = date
    if (!targetDate) {
      const [last] = await query(`SELECT DATE_FORMAT(MAX(date_releve), '%Y-%m-%d') AS last_date FROM RELEVE`) as any[]
      targetDate = last?.last_date ?? '2026-04-01'
    }

    const rows = await query(`
      SELECT 
        c.ville_capteur AS ville,
        a.region,
        AVG(r.concentration_ppm) AS concentration,
        g.sigle,
        g.nom_gaz,
        g.type_gaz,
        COUNT(r.id_releve) AS nb_capteurs
      FROM RELEVE r
      JOIN CAPTEUR c ON r.id_capteur = c.id_capteur
      JOIN GAZ g ON c.sigle = g.sigle
      JOIN Agence a ON c.id_agence = a.id_agence
      WHERE g.sigle = ? AND r.date_releve = ?
      GROUP BY c.ville_capteur, a.region, g.sigle, g.nom_gaz, g.type_gaz
      LIMIT 50000
    `, [sigle, targetDate])

    return NextResponse.json({ rows, date: targetDate })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
