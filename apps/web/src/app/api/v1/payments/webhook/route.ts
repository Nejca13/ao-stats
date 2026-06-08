import { NextResponse } from 'next/server'
import { groupsCollection } from '@/lib/db'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ status: 'ok' })
    }

    const payment = await new Payment(client).get({ id: data.id })

    if (payment.status === 'approved' && payment.external_reference) {
      try {
        const ref = JSON.parse(payment.external_reference as string)
        const { groupId, planId } = ref

        if (groupId && planId) {
          await groupsCollection().updateOne(
            { id: groupId },
            { $set: { plan: planId } },
          )
          console.log(`[MP Webhook] Grupo ${groupId} actualizado a plan ${planId}`)
        }
      } catch (parseError) {
        console.error('[MP Webhook] Error al parsear external_reference:', parseError)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[MP Webhook] Error:', error)
    return NextResponse.json({ status: 'ok' })
  }
}
