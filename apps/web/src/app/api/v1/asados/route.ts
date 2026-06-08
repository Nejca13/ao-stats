import { NextResponse } from 'next/server'
import { asadosCollection } from '@/lib/db'
import { getUserGroup, getPlanLimits } from '@/lib/plan-gates'
import { getLegacySnapshot } from '@/lib/legacy-migration'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const { asadoLimit } = getPlanLimits(group.plan)

    let asados = await asadosCollection()
      .find({ groupId: group.id })
      .project({ _id: 0 })
      .sort({ date: -1 })
      .limit(asadoLimit)
      .toArray()

    let legacy = false
    let total = await asadosCollection().countDocuments({ groupId: group.id })

    if (asados.length === 0) {
      const snapshot = await getLegacySnapshot()
      if (snapshot?.asados?.length) {
        asados = snapshot.asados
        legacy = true
        total = asados.length
      }
    }

    const limited = isFinite(asadoLimit) && asadoLimit < total

    return NextResponse.json({ asados, limited, total, legacy })
  } catch (error) {
    console.error('Error en GET /api/v1/asados:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
