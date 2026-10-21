import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { securiserSelect, TIMEOUT_MS } from '@/lib/sqlGuard'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const validation = securiserSelect(searchParams.get('sql') ?? '')

  if (!validation.ok) {
    return NextResponse.json({ error: validation.erreur }, { status: 400 })
  }

  try {
    const rows = await query(validation.sql, [], TIMEOUT_MS + 1000)
    return NextResponse.json({ rows, count: rows.length })
  } catch (e: any) {
    const timeout = e?.code === 'PROTOCOL_SEQUENCE_TIMEOUT' || /max(imum)?[_ ]execution[_ ]time|interrupted/i.test(e?.message ?? '')
    return NextResponse.json(
      { error: timeout ? `Requête interrompue : plus de ${TIMEOUT_MS / 1000} s d'exécution` : 'Erreur lors de l\'exécution de la requête' },
      { status: timeout ? 408 : 500 }
    )
  }
}
