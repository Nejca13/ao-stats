import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { groupsCollection } from '@/lib/db'
import AccountManager from './AccountManager'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const group = await groupsCollection().findOne(
    { memberIds: session.user.id },
    { projection: { _id: 0 } },
  )

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Cuenta</h1>
      <AccountManager
        group={group ? JSON.parse(JSON.stringify(group)) : null}
        userEmail={session.user.email ?? ''}
      />
    </div>
  )
}
