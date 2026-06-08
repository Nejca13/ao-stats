import { processStatsData } from '@ao/shared'
import { auth } from '@/lib/auth'
import { playersCollection, asadosCollection, matchesCollection, groupsCollection } from '@/lib/db'
import AORendering from './AORendering'
import s from './ao.module.css'

export const dynamic = 'force-dynamic'

export default async function AOPage() {
  try {
    const session = await auth()
    let stats = null

    if (session?.user?.id) {
      const group = await groupsCollection().findOne(
        { memberIds: session.user.id },
        { projection: { _id: 0 } },
      )

      if (group) {
        const [players, asados, matches] = await Promise.all([
          playersCollection().find({ groupId: group.id }).project({ _id: 0 }).toArray(),
          asadosCollection().find({ groupId: group.id }).project({ _id: 0 }).toArray(),
          matchesCollection().find({ groupId: group.id }).project({ _id: 0 }).toArray(),
        ])

        if (players.length > 0 || asados.length > 0 || matches.length > 0) {
          stats = processStatsData({ players, asados, matches })
        }
      }
    }

    if (!stats) {
      return (
        <div className={s.aoPage}>
          <div className={s.loadingContainer}>
            <p className={s.loadingText}>No hay datos de estadísticas disponibles.</p>
          </div>
        </div>
      )
    }

    return <AORendering stats={stats} />

  } catch (error) {
    console.error('Error en AO Server Page:', error)
    return (
      <div className={s.aoPage}>
        <div className={s.errorContainer}>
          <p className={s.errorMsg}>Error al cargar las estadísticas.</p>
        </div>
      </div>
    )
  }
}
