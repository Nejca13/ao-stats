import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { groupsCollection } from '@/lib/db'
import s from '../dashboard.module.css'
import GroupManager from './GroupManager'

export const dynamic = 'force-dynamic'

export default async function GrupoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const groups = await groupsCollection()
    .find({ memberIds: session.user.id })
    .project({ _id: 0 })
    .toArray()

  return (
    <div>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Mi Grupo</h1>
        <p className={s.pageDesc}>
          {groups.length > 0
            ? 'Administra tu grupo y plan'
            : 'Crea un grupo para empezar a usar AO Stats'}
        </p>
      </div>
      <GroupManager groups={JSON.parse(JSON.stringify(groups))} userId={session.user.id} />
    </div>
  )
}
