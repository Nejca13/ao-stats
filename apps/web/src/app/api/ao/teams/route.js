import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import clientPromise from '../utils/mongodbTeams'

const TEAM_NAMES = {
  'accrintonstanley': 'Accrington Stanley',
  'afcwimbledon': 'AFC Wimbledon',
  'barrowafc': 'Barrow AFC',
  'bradfordcity': 'Bradford City',
  'colchester': 'Colchester United',
  'crawleytown': 'Crawley Town',
  'crewealexandra': 'Crewe Alexandra',
  'doncasterrovers': 'Doncaster Rovers',
  'forestgreen': 'Forest Green Rovers',
  'genoble-gf': 'Grenoble Foot 38',
  'gillinhamfc': 'Gillingham FC',
  'grimsbytown': 'Grimsby Town',
  'harrogatetown': 'Harrogate Town',
  'hartlepoolunited': 'Hartlepool United',
  'leytonorient': 'Leyton Orient',
  'mansfieldtown': 'Mansfield Town',
  'miltonkeynes': 'Milton Keynes Dons',
  'morecambe': 'Morecambe FC',
  'newportcounty': 'Newport County',
  'northamptontown': 'Northampton Town',
  'nottscountry': 'Notts County',
  'riverplate-fc': 'River Plate FC',
  'rochdaleafc': 'Rochdale AFC',
  'salfordcity': 'Salford City',
  'sc-bastia': 'SC Bastia',
  'stevenagefc': 'Stevenage FC',
  'stockport': 'Stockport County',
  'suttonunited': 'Sutton United',
  'swindontown': 'Swindon Town',
  'tranmererovers': 'Tranmere Rovers',
  'ucd dublin': 'UCD Dublin',
  'walsal': 'Walsall FC',
  'wexham': 'Wrexham AFC'
}

export async function GET() {
  try {
    let dbTeams = []
    try {
      const client = await clientPromise
      const db = client.db('teams_crest')
      const docs = await db.collection('ao_teams').find({}).toArray()
      dbTeams = docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        logoUrl: doc.logoUrl
      }))
    } catch (dbError) {
      console.error('Error al consultar la base de datos de escudos:', dbError)
    }

    let localTeams = []
    const apiTeamsDir = path.join(process.cwd(), 'public', 'api_teams')

    if (fs.existsSync(apiTeamsDir)) {
      const files = fs.readdirSync(apiTeamsDir)
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp']

      localTeams = files
        .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => {
          const id = path.basename(file, path.extname(file)).toLowerCase()
          const name = TEAM_NAMES[id] || id.charAt(0).toUpperCase() + id.slice(1)
          return {
            id,
            name,
            logoUrl: `/api_teams/${file}`
          }
        })
    }

    const teamsMap = new Map()

    localTeams.forEach(team => {
      teamsMap.set(team.id, team)
    })

    dbTeams.forEach(team => {
      teamsMap.set(team.id, team)
    })

    const combinedTeams = Array.from(teamsMap.values())

    return NextResponse.json({
      status: 'ok',
      count: combinedTeams.length,
      teams: combinedTeams
    })
  } catch (error) {
    console.error('Error al obtener equipos de AO:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
