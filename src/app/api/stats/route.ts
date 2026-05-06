import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const [stats] = await query(`
      SELECT
        (SELECT COUNT(*) FROM Agence) AS agences,
        (SELECT COUNT(*) FROM CAPTEUR) AS capteurs,
        (SELECT COUNT(*) FROM CAPTEUR WHERE actif = 1) AS capteurs_actifs,
        (SELECT COUNT(*) FROM RELEVE) AS releves,
        (SELECT COUNT(*) FROM RAPPORT) AS rapports,
        (SELECT COUNT(*) FROM EMPLOYE) AS employes,
        (SELECT COUNT(DISTINCT region) FROM Agence) AS regions
    `)
    return NextResponse.json(stats)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
