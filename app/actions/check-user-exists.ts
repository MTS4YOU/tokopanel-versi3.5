"use server"

import { Pterodactyl } from "@/lib/pterodactyl"

export async function checkUserExists(
  username: string,
  email: string,
  serverType: "public" | "private"
) {
  try {
    const pterodactyl = new Pterodactyl(serverType, "reguler")
    const users = await pterodactyl.listUsers()

    const usernameExists = users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    )

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )

    return {
      success: true,
      usernameExists,
      emailExists,
    }
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal memeriksa username atau email",
    }
  }
}
