import { NextResponse } from 'next/server'
import { matchesCollection, asadosCollection } from '@/lib/db'
import { getUserGroup, getPlanLimits } from '@/lib/plan-gates'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { asadoId, winnerId, loserId, winnerGoles, loserGoles } = body

    if (!asadoId || !winnerId || !loserId) {
      return NextResponse.json({ status: 'error', message: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (winnerId === loserId) {
      return NextResponse.json({ status: 'error', message: 'El ganador y perdedor deben ser distintos' }, { status: 400 })
    }

    const asado = await asadosCollection().findOne({ id: asadoId, groupId: group.id })
    if (!asado) {
      return NextResponse.json({ status: 'error', message: 'Asado no encontrado' }, { status: 404 })
    }

    if (!asado.isActive) {
      return NextResponse.json({ status: 'error', message: 'El asado ya fue finalizado' }, { status: 400 })
    }

    if (!asado.playerIds.includes(winnerId) || !asado.playerIds.includes(loserId)) {
      return NextResponse.json({ status: 'error', message: 'Ambos jugadores deben asistir al asado' }, { status: 400 })
    }

    const match = {
      id: crypto.randomUUID(),
      asadoId,
      winnerId,
      loserId,
      winnerGoles: typeof winnerGoles === 'number' ? winnerGoles : null,
      loserGoles: typeof loserGoles === 'number' ? loserGoles : null,
      groupId: group.id,
      createdAt: new Date().toISOString(),
    }

    await matchesCollection().insertOne(match)

    return NextResponse.json({ status: 'ok', match }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/v1/matches:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const { matchLimit } = getPlanLimits(group.plan)

    const matches = await matchesCollection()
      .find({ groupId: group.id })
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .limit(matchLimit)
      .toArray()

    const total = await matchesCollection().countDocuments({ groupId: group.id })
    const limited = isFinite(matchLimit) && matchLimit < total

    return NextResponse.json({ matches, limited, total })
  } catch (error) {
    console.error('Error en GET /api/v1/matches:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
