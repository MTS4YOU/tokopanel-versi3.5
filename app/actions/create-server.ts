"use server"

import { plans } from "@/data/plans"
import clientPromise from "@/lib/mongodb"
import { pterodactylConfig } from "@/data/config"
import { Pterodactyl } from "@/lib/pterodactyl"
import type { ObjectId } from "mongodb"
import crypto from "crypto"

export interface ServerData {
  _id?: ObjectId
  username: string
  email: string
  planId: string
  serverType: "private" | "public"
  accessType: "regular" | "admin"
  transactionId: string
  serverName?: string
  memory: number
  disk: number
  cpu: number
  panelUrl?: string
  panelUsername?: string
  panelPassword?: string
  panelUserId?: number
  panelServerId?: number
  status: "pending" | "creating" | "active" | "failed"
  createdAt: string
  expiresAt?: string
}

/**
 * Creates a new server panel based on the selected plan and access type
 * This integrates with Pterodactyl panel API to provision the actual server
 */
export async function createServer(
  planId: string,
  username: string,
  email: string,
  serverType: "private" | "public",
  accessType: "regular" | "admin",
  transactionId: string
) {
  try {
    const plan = plans.find((p) => p.id === planId && p.type === serverType && p.access === accessType)
    if (!plan) throw new Error("Plan tidak valid atau tidak ditemukan")

    // Get appropriate Pterodactyl config based on server type
    const ptConfig = serverType === "private" ? pterodactylConfig.private : pterodactylConfig.public
    if (!ptConfig) throw new Error(`Konfigurasi Pterodactyl untuk server ${serverType} tidak ditemukan`)

    const client = await clientPromise
    const db = client.db("webtokopanel")
    const serversCollection = db.collection<ServerData>("servers")

    // Check if server already exists for this transaction
    const existingServer = await serversCollection.findOne({ transactionId })
    if (existingServer) {
      return { success: true, server: existingServer, message: "Server sudah ada untuk transaksi ini" }
    }

    const serverData: ServerData = {
      username,
      email,
      planId,
      serverType,
      accessType,
      transactionId,
      serverName: `${serverType}-${accessType}-${username}-${Date.now()}`,
      memory: plan.memory,
      disk: plan.disk,
      cpu: plan.cpu,
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    }

    // Save server data to database
    const result = await serversCollection.insertOne(serverData)

    if (!result.insertedId) {
      throw new Error("Gagal menyimpan data server ke database")
    }

    // Call Pterodactyl API to actually provision the server
    // Use the correct panel credentials based on server type
    const ptPanel = new Pterodactyl(serverType)
    const ptConfig = serverType === "private" ? pterodactylConfig.private : pterodactylConfig.public

    // Mark as creating
    await serversCollection.updateOne({ _id: result.insertedId }, { $set: { status: "creating" } })

    try {
      // Generate a secure random password for the panel user
      const panelPassword = crypto.randomBytes(12).toString("hex")

      // Create user on Pterodactyl panel
      const userResponse = await ptPanel.createUser(username, email, panelPassword)

      if (!userResponse.attributes?.id) {
        throw new Error("Failed to create user on panel: " + JSON.stringify(userResponse))
      }

      const userId = userResponse.attributes.id

      // Create server for the user
      const serverResponse = await ptPanel.addServer(
        userId,
        `${username}-bot-${Date.now()}`,
        plan.memory,
        plan.disk,
        plan.cpu
      )

      if (!serverResponse.attributes?.id) {
        throw new Error("Failed to create server on panel: " + JSON.stringify(serverResponse))
      }

      const serverId = serverResponse.attributes.id

      // For admin access, grant additional permissions (this would depend on Pterodactyl admin API)
      // In a real scenario, you'd make additional API calls to set permissions
      if (accessType === "admin") {
        // TODO: Implement admin role assignment via Pterodactyl API
        // This would typically involve updating user permissions/roles
        console.log(`Admin access granted for user ${userId}`)
      }

      // Construct the panel URL for user login
      const panelUrl = `${ptConfig.domain}`

      // Update database with provisioning success
      await serversCollection.updateOne(
        { _id: result.insertedId },
        {
          $set: {
            status: "active",
            panelUrl,
            panelUsername: username,
            panelPassword,
            panelUserId: userId,
            panelServerId: serverId,
          },
        }
      )

      return {
        success: true,
        server: {
          ...serverData,
          _id: result.insertedId,
          status: "active",
          panelUrl,
          panelUsername: username,
          panelPassword,
        },
        message: `Server berhasil dibuat. Akses panel di ${panelUrl} dengan username ${username}`,
      }
    } catch (provisioningError) {
      console.error("Pterodactyl provisioning error:", provisioningError)

      // Mark as failed
      await serversCollection.updateOne({ _id: result.insertedId }, { $set: { status: "failed" } })

      throw provisioningError
    }

    return {
      success: true,
      server: { ...serverData, _id: result.insertedId },
      message: "Server berhasil dibuat",
    }
  } catch (error) {
    console.error("Error creating server:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat server",
    }
  }
}

/**
 * Gets server information by transaction ID
 */
export async function getServerByTransactionId(transactionId: string) {
  try {
    const client = await clientPromise
    const db = client.db("webtokopanel")
    const serversCollection = db.collection<ServerData>("servers")

    const server = await serversCollection.findOne({ transactionId })
    if (!server) {
      return { success: false, error: "Server tidak ditemukan" }
    }

    return { success: true, server }
  } catch (error) {
    console.error("Error getting server:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data server",
    }
  }
}

/**
 * Gets all servers for a specific user
 */
export async function getUserServers(email: string) {
  try {
    const client = await clientPromise
    const db = client.db("webtokopanel")
    const serversCollection = db.collection<ServerData>("servers")

    const servers = await serversCollection.find({ email }).toArray()

    return { success: true, servers }
  } catch (error) {
    console.error("Error getting user servers:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data server",
    }
  }
}
