import { NextResponse } from 'next/server'
import { matchesCollection } from '@/lib/db'
import { getUserGroup, getPlanLimits } from '@/lib/plan-gates'
import { getLegacySnapshot } from '@/lib/legacy-migration'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const { matchLimit } = getPlanLimits(group.plan)

    let matches = await matchesCollection()
      .find({ groupId: group.id })
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .limit(matchLimit)
      .toArray()

    let legacy = false
    let total = await matchesCollection().countDocuments({ groupId: group.id })

    if (matches.length === 0) {
      const snapshot = await getLegacySnapshot()
      if (snapshot?.matches?.length) {
        matches = snapshot.matches
        legacy = true
        total = matches.length
      }
    }

    const limited = isFinite(matchLimit) && matchLimit < total

    return NextResponse.json({ matches, limited, total, legacy })
  } catch (error) {
    console.error('Error en GET /api/v1/matches:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
