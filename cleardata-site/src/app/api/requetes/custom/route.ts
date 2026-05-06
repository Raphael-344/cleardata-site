import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sql = searchParams.get('sql')

  if (!sql) return NextResponse.json({ error: 'SQL manquant' }, { status: 400 })

  // Sécurité : uniquement SELECT
  if (!sql.trim().toUpperCase().startsWith('SELECT')) {
    return NextResponse.json({ error: 'Seules les requêtes SELECT sont autorisées' }, { status: 403 })
  }

  try {
    const rows = await query(sql)
    return NextResponse.json({ rows, count: (rows as any[]).length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
