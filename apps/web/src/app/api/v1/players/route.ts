import { NextResponse } from 'next/server'
import { playersCollection } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const players = await playersCollection()
      .find({})
      .project({ _id: 0 })
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Error en GET /api/v1/players:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
