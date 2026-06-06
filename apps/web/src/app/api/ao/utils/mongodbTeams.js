import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_AO_URI_TEAM_CREST
const options = {}

let client
let clientPromise

if (!process.env.MONGODB_AO_URI_TEAM_CREST) {
  throw new Error('Please add your MONGODB_AO_URI_TEAM_CREST to .env')
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromiseTeams) {
    client = new MongoClient(uri, options)
    global._mongoClientPromiseTeams = client.connect()
  }
  clientPromise = global._mongoClientPromiseTeams
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
