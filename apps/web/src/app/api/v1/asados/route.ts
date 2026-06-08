import { NextResponse } from 'next/server'
import { asadosCollection } from '@/lib/db'
import { getUserGroup, getPlanLimits } from '@/lib/plan-gates'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const { asadoLimit } = getPlanLimits(group.plan)
    const total = await asadosCollection().countDocuments({ groupId: group.id })
    if (isFinite(asadoLimit) && total >= asadoLimit) {
      return NextResponse.json(
        { status: 'error', message: `Límite de ${asadoLimit} asados alcanzado. Actualizá tu plan para crear más.` },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { date, playerIds, comment } = body

    if (!date) {
      return NextResponse.json({ status: 'error', message: 'La fecha es requerida' }, { status: 400 })
    }

    if (!Array.isArray(playerIds) || playerIds.length < 2) {
      return NextResponse.json({ status: 'error', message: 'Se requieren al menos 2 jugadores' }, { status: 400 })
    }

    const asado = {
      id: crypto.randomUUID(),
      groupId: group.id,
      date,
      playerIds,
      comment: comment || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    await asadosCollection().insertOne(asado)

    return NextResponse.json({ status: 'ok', asado }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/v1/asados:', error)
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

    const { asadoLimit } = getPlanLimits(group.plan)

    const asados = await asadosCollection()
      .find({ groupId: group.id })
      .project({ _id: 0 })
      .sort({ date: -1 })
      .limit(asadoLimit)
      .toArray()

    const total = await asadosCollection().countDocuments({ groupId: group.id })
    const limited = isFinite(asadoLimit) && asadoLimit < total

    return NextResponse.json({ asados, limited, total })
  } catch (error) {
    console.error('Error en GET /api/v1/asados:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
