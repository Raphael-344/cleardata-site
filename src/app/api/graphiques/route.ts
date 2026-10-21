import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'evolution'
  const sigle = searchParams.get('sigle') || 'CO2'
  const region = searchParams.get('region') || 'Île-de-France'

  try {
    if (type === 'evolution') {
      const rows = await query(`
        SELECT YEAR(r.date_releve) AS annee, MONTH(r.date_releve) AS mois,
          ROUND(AVG(r.concentration_ppm), 4) AS moyenne
        FROM RELEVE r
        JOIN CAPTEUR c ON r.id_capteur = c.id_capteur
        JOIN GAZ g ON c.sigle = g.sigle
        JOIN Agence a ON c.id_agence = a.id_agence
        WHERE g.sigle = ? AND a.region = ?
        GROUP BY YEAR(r.date_releve), MONTH(r.date_releve)
        ORDER BY annee, mois
      `, [sigle, region])
      return NextResponse.json(rows)
    }

    if (type === 'regions') {
      const rows = await query(`
        SELECT a.region, ROUND(AVG(r.concentration_ppm), 4) AS moyenne
        FROM RELEVE r
        JOIN CAPTEUR c ON r.id_capteur = c.id_capteur
        JOIN GAZ g ON c.sigle = g.sigle
        JOIN Agence a ON c.id_agence = a.id_agence
        WHERE g.sigle = ? AND r.date_releve > (SELECT DATE_SUB(MAX(date_releve), INTERVAL 12 MONTH) FROM RELEVE)
        GROUP BY a.region ORDER BY moyenne DESC
      `, [sigle])
      return NextResponse.json(rows)
    }

    if (type === 'gaz') {
      const rows = await query(`
        SELECT g.sigle, g.nom_gaz, ROUND(AVG(r.concentration_ppm), 4) AS moyenne
        FROM RELEVE r
        JOIN CAPTEUR c ON r.id_capteur = c.id_capteur
        JOIN GAZ g ON c.sigle = g.sigle
        JOIN Agence a ON c.id_agence = a.id_agence
        WHERE a.region = ? AND r.date_releve > (SELECT DATE_SUB(MAX(date_releve), INTERVAL 12 MONTH) FROM RELEVE)
        GROUP BY g.sigle, g.nom_gaz ORDER BY g.sigle
      `, [region])
      return NextResponse.json(rows)
    }

    return NextResponse.json({ error: 'Type inconnu' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
