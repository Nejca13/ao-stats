import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getLegacySnapshot } from '@/lib/legacy-migration'
import { syncSnapshotToV2 } from '@/lib/db/syncSnapshot'
import { groupsCollection } from '@/lib/db'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const group = await groupsCollection().findOne(
      { memberIds: session.user.id },
      { projection: { _id: 0, id: 1 } },
    )
    if (!group) {
      return NextResponse.json({ error: 'No tenés un grupo. Crea o unite a uno primero.' }, { status: 400 })
    }

    const snapshot = await getLegacySnapshot()
    if (!snapshot) {
      return NextResponse.json({ error: 'No hay datos legacy para migrar' }, { status: 404 })
    }

    const result = await syncSnapshotToV2(snapshot, group.id)

    return NextResponse.json({
      message: 'Migración completada',
      migrated: true,
      result,
    })
  } catch (error) {
    console.error('Error en migración:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
