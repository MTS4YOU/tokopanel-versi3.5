"use server"

import { calculateFee, generateTransactionId } from "@/lib/utils"
import { plans } from "@/data/plans"
import { revalidatePath } from "next/cache"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import type { ObjectId } from "mongodb"
import crypto from "crypto"

const SAKURU_API_ID = appConfig.pay.api_id
const SAKURU_API_KEY = appConfig.pay.api_key
const SAKURU_API_URL = "https://sakurupiah.id/api/create.php"

export interface PaymentData {
  _id?: ObjectId
  transactionId: string
  vpediaId: string
  planId: string
  username: string
  email: string
  serverType: "public" | "private"
  accessType: "regular" | "admin"
  amount: number
  fee: number
  total: number
  qrImageUrl: string
  expirationTime: string
  status: "pending" | "paid" | "completed" | "failed"
  createdAt: string
  panelDetails?: {
    username: string
    password: string
    serverId: number
  }
}

export async function createPayment(data: {
  planId: string
  username: string
  email: string
  serverType: "public" | "private"
  accessType: "regular" | "admin"
}) {
  try {
    const { planId, username, email, serverType, accessType } = data

    const plan = plans.find((p) => p.id === planId)
    if (!plan) throw new Error("Plan tidak ditemukan")

    /** validasi tambahan (safety) */
    if (plan.type !== serverType || plan.access !== accessType) {
      throw new Error("Plan tidak sesuai dengan tipe server atau akses")
    }

    const internalFee = calculateFee(plan.price)
    const nominal = plan.price + internalFee

    const transactionId = generateTransactionId()
    const method = "QRIS2"

    const signature = crypto
      .createHmac("sha256", SAKURU_API_KEY)
      .update(SAKURU_API_ID + method + transactionId + nominal)
      .digest("hex")

    const bodyData = new URLSearchParams()
    bodyData.append("api_id", SAKURU_API_ID)
    bodyData.append("method", method)
    bodyData.append("name", username)
    bodyData.append("email", email)
    bodyData.append("phone", "6280000000000")
    bodyData.append("amount", nominal.toString())
    bodyData.append("merchant_fee", "1")
    bodyData.append("merchant_ref", transactionId)
    bodyData.append("expired", "24")
    bodyData.append("produk[]", plan.name)
    bodyData.append("qty[]", "1")
    bodyData.append("harga[]", plan.price.toString())
    bodyData.append(
      "callback_url",
      "https://panelshopv3.mts4you.biz.id/callback"
    )
    bodyData.append(
      "return_url",
      `https://panelshopv3.mts4you.biz.id/invoice/${transactionId}`
    )
    bodyData.append("signature", signature)

    const response = await fetch(SAKURU_API_URL, {
      method: "POST",
      body: bodyData,
      headers: {
        Authorization: `Bearer ${SAKURU_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    const raw = await response.text()

    let json: any
    try {
      json = JSON.parse(raw)
    } catch {
      console.error("Sakurupiah NON-JSON:", raw)
      throw new Error("API Sakurupiah tidak mengembalikan JSON")
    }

    if (json.status !== "200") {
      throw new Error(json.message || "Gagal membuat invoice")
    }

    const pay = json.data[0]

    const paymentData: PaymentData = {
      transactionId,
      vpediaId: pay.trx_id,
      planId,
      username,
      email,
      serverType,
      accessType,
      amount: nominal,
      fee: internalFee,
      total: nominal,
      qrImageUrl: pay.qr,
      expirationTime: new Date(pay.expired).toISOString(),
      status: pay.payment_status === "pending" ? "pending" : "failed",
      createdAt: new Date().toISOString(),
    }

    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)

    await db.collection<PaymentData>("payments").insertOne(paymentData)

    revalidatePath(`/invoice/${transactionId}`)

    return { success: true, transactionId }
  } catch (error) {
    console.error("Error createPayment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan",
    }
  }
}

export async function getPayment(
  transactionId: string
): Promise<PaymentData | null> {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    return (await db
      .collection("payments")
      .findOne({ transactionId })) as PaymentData | null
  } catch (error) {
    console.error("Error getPayment:", error)
    return null
  }
}

export async function updatePaymentStatus(
  transactionId: string,
  status: "pending" | "paid" | "completed" | "failed",
  panelDetails?: {
    username: string
    password: string
    serverId: number
  }
): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)

    const updateData: Partial<PaymentData> = { status }
    if (panelDetails) updateData.panelDetails = panelDetails

    const result = await db
      .collection("payments")
      .updateOne({ transactionId }, { $set: updateData })

    if (result.matchedCount > 0) {
      revalidatePath(`/invoice/${transactionId}`)
      return true
    }
    return false
  } catch (error) {
    console.error("Error updatePaymentStatus:", error)
    return false
  }
  }
