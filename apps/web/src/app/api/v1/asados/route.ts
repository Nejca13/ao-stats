import { NextResponse } from 'next/server'
import { asadosCollection } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const asados = await asadosCollection()
      .find({})
      .project({ _id: 0 })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json({ asados })
  } catch (error) {
    console.error('Error en GET /api/v1/asados:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
