import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_AO_URI_V2
const DB_NAME = 'asao_v2'

let client: MongoClient
let db: Db

if (!uri) {
  throw new Error('Please add your MONGODB_AO_URI_V2 to .env')
}

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientV2?: MongoClient
    _mongoDbV2?: Db
  }

  if (!globalWithMongo._mongoClientV2) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientV2 = client
    globalWithMongo._mongoDbV2 = client.db(DB_NAME)
  }
  client = globalWithMongo._mongoClientV2
  db = globalWithMongo._mongoDbV2!
} else {
  client = new MongoClient(uri)
  db = client.db(DB_NAME)
}

export { client, db }
export default db
