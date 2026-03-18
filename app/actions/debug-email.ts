'use server'

import { sendPanelDetailsEmail } from '@/lib/email-service'

export async function debugSendEmail(formData: FormData) {
  const to = formData.get('to') as string
  const idtransaksi = formData.get('idtransaksi') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const serverId = Number(formData.get('serverId'))
  const planName = formData.get('planName') as string
  const serverType = formData.get('serverType') as 'public' | 'private'

  const res = await sendPanelDetailsEmail(
    to,
    idtransaksi,
    username,
    password,
    serverId,
    planName,
    serverType
  )

  return res
}
