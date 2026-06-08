import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { groupsCollection } from '@/lib/db'
import { createPreference } from '@/lib/mercado-pago'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, groupId } = body

    if (!planId || !groupId) {
      return NextResponse.json(
        { status: 'error', message: 'Faltan planId o groupId' },
        { status: 400 },
      )
    }

    const group = await groupsCollection().findOne({ id: groupId })
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'Grupo no encontrado' }, { status: 404 })
    }

    if (group.ownerId !== session.user.id) {
      return NextResponse.json(
        { status: 'error', message: 'Solo el dueño del grupo puede cambiar el plan' },
        { status: 403 },
      )
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { status: 'error', message: 'Mercado Pago no configurado. Contactanos para upgrades manuales.' },
        { status: 501 },
      )
    }

    const result = await createPreference(planId, groupId, session.user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error al crear preferencia MP:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error al iniciar el pago' },
      { status: 500 },
    )
  }
}
