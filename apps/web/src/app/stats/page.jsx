import { processStatsData } from '../api/ao/utils/statsUtils'
import clientPromise from '../api/ao/utils/mongodb'
import AORendering from './AORendering'
import s from './ao.module.css'

export const dynamic = 'force-dynamic'

export default async function AOPage() {
  try {
    const client = await clientPromise
    const db = client.db('asao')

    const latestDoc = await db.collection('ao_snapshots')
      .find({ app: "AO & FIFA" })
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray()

    if (!latestDoc || latestDoc.length === 0) {
      return (
        <div className={s.aoPage}>
          <div className={s.loadingContainer}>
            <p className={s.loadingText}>No hay datos de estadísticas disponibles.</p>
          </div>
        </div>
      )
    }

    const stats = processStatsData(latestDoc[0].snapshot)

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
