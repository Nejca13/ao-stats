import { NextResponse } from 'next/server'
import { playersCollection } from '@/lib/db'
import { getUserGroup } from '@/lib/plan-gates'
import { getLegacySnapshot } from '@/lib/legacy-migration'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    let players = await playersCollection()
      .find({ groupId: group.id })
      .project({ _id: 0 })
      .sort({ name: 1 })
      .toArray()

    let legacy = false
    if (players.length === 0) {
      const snapshot = await getLegacySnapshot()
      if (snapshot?.players?.length) {
        players = snapshot.players
        legacy = true
      }
    }

    return NextResponse.json({ players, legacy })
  } catch (error) {
    console.error('Error en GET /api/v1/players:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
