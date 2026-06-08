import { redirect } from 'next/navigation'
import { getDashboardData } from '@/lib/dashboard-data'
import AsadosClient from './asados-client'

export const dynamic = 'force-dynamic'

export default async function AsadosPage() {
  const data = await getDashboardData()
  if (!data) redirect('/auth/login')

  return <AsadosClient data={data} />
}