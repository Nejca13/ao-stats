import { NextResponse } from 'next/server'
import { encode } from '@auth/core/jwt'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import clientPromise from '@/app/api/ao/utils/mongodb'

const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID
const AUTH_SECRET = process.env.AUTH_SECRET!

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
)

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ error: 'Falta idToken' }, { status: 400 })
    }

    let payload: { email?: string; name?: string; picture?: string; sub?: string }
    try {
      const result = await jwtVerify(idToken, JWKS, {
        audience: GOOGLE_CLIENT_ID,
      })
      payload = result.payload as typeof payload
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    if (!payload.email) {
      return NextResponse.json({ error: 'Falta email en el token' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('asao')
    const users = db.collection('users')

    let user = await users.findOne({ email: payload.email })
    if (!user) {
      const result = await users.insertOne({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        image: payload.picture || null,
        emailVerified: null,
        createdAt: new Date(),
      })
      user = {
        _id: result.insertedId,
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        image: payload.picture || null,
      }
    }

    const sessionToken = await encode({
      token: {
        name: user.name,
        email: user.email,
        picture: user.image,
        sub: user._id.toString(),
      },
      secret: AUTH_SECRET,
      salt: '__Secure-authjs.session-token',
    })

    return NextResponse.json({
      token: sessionToken,
      user: { name: user.name, email: user.email, image: user.image },
    })
  } catch (error) {
    console.error('Error en POST /api/v1/auth/google:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
