import { NextResponse } from 'next/server'
import { matchesCollection } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const matches = await matchesCollection()
      .find({})
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Error en GET /api/v1/matches:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
