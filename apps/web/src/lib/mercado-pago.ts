import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
})

const BACKEND_URL = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

const PLAN_PRICES: Record<string, number> = {
  asado: 300,
  parrillero: 1000,
  asador_mayor: 2000,
  bar_lounge: 3000,
  liga: 7500,
}

const PLAN_LABELS: Record<string, string> = {
  asado: 'Plan Asado',
  parrillero: 'Plan Parrillero',
  asador_mayor: 'Plan Asador Mayor',
  bar_lounge: 'Plan Bar / Lounge',
  liga: 'Plan Liga Organizada',
}

export async function createPreference(
  planId: string,
  groupId: string,
  userId: string,
): Promise<{ initPoint: string; preferenceId: string }> {
  const price = PLAN_PRICES[planId]
  if (!price) throw new Error(`Plan invalido: ${planId}`)

  const preference = await new Preference(client).create({
    body: {
      items: [
        {
          id: planId,
          title: PLAN_LABELS[planId] ?? planId,
          unit_price: price,
          quantity: 1,
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${BACKEND_URL}/dashboard/account?mp_status=success`,
        failure: `${BACKEND_URL}/dashboard/account?mp_status=failure`,
        pending: `${BACKEND_URL}/dashboard/account?mp_status=pending`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({ groupId, userId, planId }),
      notification_url: `${BACKEND_URL}/api/v1/payments/webhook`,
    },
  })

  if (!preference.id || !preference.init_point) {
    throw new Error('No se pudo crear la preferencia de pago')
  }

  return {
    initPoint: preference.init_point,
    preferenceId: preference.id,
  }
}
