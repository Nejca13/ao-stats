import { NextResponse } from 'next/server'
import { playersCollection } from '@/lib/db'
import { getUserGroup } from '@/lib/plan-gates'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ status: 'error', message: 'El nombre del jugador es requerido' }, { status: 400 })
    }

    const player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      groupId: group.id,
      elo: 1500,
      createdAt: new Date().toISOString(),
      avatarUrl: null,
      colorHex: null,
    }

    await playersCollection().insertOne(player)

    return NextResponse.json({ status: 'ok', player }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/v1/players:', error)
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

    const players = await playersCollection()
      .find({ groupId: group.id })
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
