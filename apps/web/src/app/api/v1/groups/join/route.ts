import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { groupsCollection } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''

  if (!slug) {
    return NextResponse.json({ status: 'error', message: 'Falta el slug del grupo' }, { status: 400 })
  }

  const group = await groupsCollection().findOne({ slug })
  if (!group) {
    return NextResponse.json({ status: 'error', message: 'Grupo no encontrado' }, { status: 404 })
  }

  if (group.memberIds.includes(session.user.id)) {
    return NextResponse.json({ status: 'error', message: 'Ya eres miembro de este grupo' }, { status: 409 })
  }

  await groupsCollection().updateOne(
    { slug },
    { $push: { memberIds: session.user.id } as any },
  )

  return NextResponse.json({ status: 'ok', group })
}
