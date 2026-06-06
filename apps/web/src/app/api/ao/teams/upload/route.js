import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import clientPromise from '../../utils/mongodbTeams'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const teamNameInput = formData.get('teamName') || ''
    const teamId = formData.get('teamId')

    if (!file) {
      return NextResponse.json({ status: 'error', message: 'No se ha proporcionado ningun archivo.' }, { status: 400 })
    }
    if (!teamId) {
      return NextResponse.json({ status: 'error', message: 'El ID del equipo es obligatorio.' }, { status: 400 })
    }

    const cleanTeamId = teamId.trim().toLowerCase()
    const cleanTeamName = teamNameInput.trim() || cleanTeamId.charAt(0).toUpperCase() + cleanTeamId.slice(1)

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({
        status: 'error',
        message: 'Las credenciales de Cloudinary no estan configuradas en el servidor.'
      }, { status: 500 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'api_teams',
          public_id: cleanTeamId,
          overwrite: true,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
      uploadStream.end(buffer)
    })

    const client = await clientPromise
    const db = client.db('teams_crest')
    await db.collection('ao_teams').updateOne(
      { id: cleanTeamId },
      {
        $set: {
          id: cleanTeamId,
          name: cleanTeamName,
          logoUrl: result.secure_url,
          uploadedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({
      status: 'ok',
      message: 'Escudo subido exitosamente a Cloudinary y guardado en la base de datos',
      data: {
        id: cleanTeamId,
        name: cleanTeamName,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height
      }
    })

  } catch (error) {
    console.error('Error en POST /api/ao/teams/upload:', error)
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Error interno del servidor al procesar la subida.'
    }, { status: 500 })
  }
}
