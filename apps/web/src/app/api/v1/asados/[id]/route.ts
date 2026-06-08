import { NextResponse } from 'next/server'
import { asadosCollection } from '@/lib/db'
import { getUserGroup } from '@/lib/plan-gates'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const asado = await asadosCollection().findOne({ id, groupId: group.id })
    if (!asado) {
      return NextResponse.json({ status: 'error', message: 'Asado no encontrado' }, { status: 404 })
    }

    const body = await request.json()

    if (body.isActive === false) {
      await asadosCollection().updateOne(
        { id },
        { $set: { isActive: false } },
      )
      return NextResponse.json({ status: 'ok', asado: { ...asado, isActive: false } })
    }

    if (body.isActive === true) {
      await asadosCollection().updateOne(
        { id },
        { $set: { isActive: true } },
      )
      return NextResponse.json({ status: 'ok', asado: { ...asado, isActive: true } })
    }

    return NextResponse.json({ status: 'error', message: 'Nada que actualizar' }, { status: 400 })
  } catch (error) {
    console.error('Error en PATCH /api/v1/asados/[id]:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
