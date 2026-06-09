import clientPromise from '@/app/api/ao/utils/mongodb'

export async function getLegacySnapshot() {
  try {
    const client = await clientPromise
    const db = client.db('asao')
    const docs = await db
      .collection('ao_snapshots')
      .find({ app: 'AO & FC' })
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray()
    return docs[0]?.snapshot || null
  } catch {
    return null
  }
}
