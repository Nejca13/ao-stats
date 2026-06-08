import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { groupsCollection } from '@/lib/db'
import { GroupSchema } from '@ao/shared'

export const dynamic = 'force-dynamic'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}

// GET /api/v1/groups — list user's groups
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
  }

  const groups = await groupsCollection()
    .find({ memberIds: session.user.id })
    .project({ _id: 0 })
    .toArray()

  return NextResponse.json({ groups })
}

// POST /api/v1/groups — create a new group
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return NextResponse.json({ status: 'error', message: 'El nombre del grupo es obligatorio' }, { status: 400 })
  }

  let slug = slugify(name)
  if (!slug) slug = `grupo-${Date.now()}`

  // Ensure unique slug
  const existing = await groupsCollection().findOne({ slug })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const group = GroupSchema.parse({
    id: crypto.randomUUID(),
    name,
    slug,
    ownerId: session.user.id,
    memberIds: [session.user.id],
    plan: 'free',
    createdAt: new Date().toISOString(),
  })

  await groupsCollection().insertOne(group as any)

  return NextResponse.json({ group }, { status: 201 })
}
