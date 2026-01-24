"use server"

import { Pterodactyl } from "@/lib/pterodactyl"
import { generatePassword } from "@/lib/utils"
import { sendPanelDetailsEmail } from "@/lib/email-service"
import { sendTelegramNotification } from "@/lib/telegram-service"
import { plans } from "@/data/plans"

type ServerType = "public" | "private"
type AccessType = "reguler" | "admin"

type PanelData = {
  username: string
  email: string
  memory: number
  disk: number
  cpu: number
  planId: string
  serverType: ServerType
  accessType: AccessType
  createdAt: string
}

export async function createPanel(data: PanelData) {
  try {
    const {
      username,
      email,
      memory,
      disk,
      cpu,
      planId,
      serverType,
      accessType,
      createdAt,
    } = data

    const password = generatePassword(10)

    // 🔥 inject panel config berdasarkan serverType
    const pterodactyl = new Pterodactyl(serverType, accessType)

    console.log(`[${serverType.toUpperCase()}] Creating user ${username}`)

    const userResponse = await pterodactyl.createUser(
      username,
      email,
      password,
      accessType
    )

    if (!userResponse.attributes) {
      throw new Error("Gagal membuat user: " + JSON.stringify(userResponse))
    }

    const userId = userResponse.attributes.id

    const serverName = `${username}'s Server`
    console.log(`[${serverType.toUpperCase()}] Creating server for user ${userId}`)

    const serverResponse = await pterodactyl.addServer(
      userId,
      serverName,
      memory,
      disk,
      cpu
    )

    if (!serverResponse.attributes) {
      await pterodactyl.deleteUser(userId)
      throw new Error("Gagal membuat server: " + JSON.stringify(serverResponse))
    }

    const serverId = serverResponse.attributes.id

    const plan = plans.find((p) => p.id === planId)
    if (!plan) {
      throw new Error("Plan tidak ditemukan")
    }

    // 📧 Email
    sendPanelDetailsEmail(
      email,
      username,
      password,
      serverId,
      plan.name,
      serverType,
    ).catch(console.error)

    // 📣 Telegram
    sendTelegramNotification(
      userId,
      createdAt,
      plan.price,
      plan.name,
      email,
    ).catch(console.error)

    return {
      success: true,
      userId,
      serverId,
      password,
    }
  } catch (error) {
    console.error("Error creating panel:", error)
    throw new Error(
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat membuat panel"
    )
  }
}
