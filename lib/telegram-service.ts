import { appConfig } from "@/data/config"

export async function sendTelegramNotification(
  userId: number,
  invoiceDate: string,
  price: number,
  planName: string,
  email: string,
) {
  try {
    // Mask the email for privacy
    const maskedEmail = maskEmail(email)

    // Format the message
    const message =
      `🔔 *New Panel Created*\n\n` +
      `👤 User ID: \`${userId}\`\n` +
      `📅 Invoice Date: ${formatDate(invoiceDate)}\n` +
      `💰 Price: ${formatRupiah(price)}\n` +
      `📦 Plan: ${planName}\n` +
      `📧 Email: ${maskedEmail}`

    // Send the message
    const response = await fetch(`https://api.telegram.org/bot${appConfig.telegram.botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: appConfig.telegram.ownerId,
        text: message,
        parse_mode: "Markdown",
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending Telegram notification:", error)
    return { success: false, error }
  }
}

// Helper function to mask email
function maskEmail(email: string): string {
  const [username, domain] = email.split("@")

  if (username.length <= 3) {
    return `${username}***@${domain}`
  }

  const visiblePart = username.substring(0, Math.ceil(username.length / 2))
  const maskedPart = "***"

  return `${visiblePart}${maskedPart}@${domain}`
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Helper function to format currency
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
