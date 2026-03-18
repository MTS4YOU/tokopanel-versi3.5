"use server"

import { getPayment, updatePaymentStatus } from "./create-payment"
import { revalidatePath } from "next/cache"
import { plans } from "@/data/plans"
import { createPanel } from "./create-panel"
import { appConfig } from "@/data/config"

const API_ID = appConfig.pay.api_id
const API_KEY = appConfig.pay.api_key
const API_STATUS_URL = "https://sakurupiah.id/api/status-transaction.php"

export async function checkPaymentStatus(transactionId: string) {
  try {
    const payment = await getPayment(transactionId)
    if (!payment) {
      return { success: false, error: "Pembayaran tidak ditemukan" }
    }

    if (payment.status === "completed") {
      return {
        success: true,
        status: "completed",
        panelDetails: payment.panelDetails,
      }
    }

    const form = new FormData()
    form.append("api_id", API_ID)
    form.append("method", "status")
    form.append("trx_id", payment.vpediaId)

    const response = await fetch(API_STATUS_URL, {
      method: "POST",
      body: form,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    const raw = await response.text()
    let data: any

    try {
      data = JSON.parse(raw)
    } catch {
      console.error("Sakurupiah NON-JSON:", raw)
      return { success: false, error: "Response Sakurupiah tidak valid" }
    }

    if (data.status !== "200") {
      return { success: false, error: "Gagal cek status pembayaran" }
    }

    const status = data.data?.[0]?.status?.toLowerCase()

    if (status === "pending") {
      return { success: true, status: "pending" }
    }

    if (status === "berhasil") {
      await updatePaymentStatus(transactionId, "paid")

      const plan = plans.find((p) => p.id === payment.planId)
      if (!plan) {
        return { success: false, error: "Plan tidak ditemukan" }
      }

      const panelResult = await createPanel({
        idtransaksi: transactionId,
        username: payment.username,
        email: payment.email,
        memory: plan.memory,
        disk: plan.disk,
        cpu: plan.cpu,
        planId: payment.planId,
        createdAt: payment.createdAt,
        serverType: payment.serverType, 
        accessType: payment.accessType, 
      })

      if (!panelResult.success) {
        await updatePaymentStatus(transactionId, "failed")
        return { success: false, error: "Gagal membuat panel" }
      }

      const panelDetails = {
        username: payment.username,
        password: panelResult.password,
        serverId: panelResult.serverId,
        serverType: payment.serverType,
      }

      await updatePaymentStatus(transactionId, "completed", panelDetails)
      revalidatePath(`/invoice/${transactionId}`)

      return {
        success: true,
        status: "completed",
        panelDetails,
        showWhatsappPopup: true,
      }
    }

    if (status === "gagal") {
      await updatePaymentStatus(transactionId, "failed")
      return { success: true, status: "failed" }
    }

    return { success: true, status: "pending" }
  } catch (error) {
    console.error("Error checking payment status:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Kesalahan memeriksa status pembayaran",
    }
  }
}
