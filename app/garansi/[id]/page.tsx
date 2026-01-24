"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { getTransactionById, updateTransactionReplace } from "@/app/actions/get-transactions"
import { checkUserExists } from "@/app/actions/check-user-exists"
import { createPanel } from "@/app/actions/create-panel"
import { appConfig } from "@/data/config"
import { plans } from "@/data/plans"
import { Loader2, ShieldCheck, AlertTriangle, Server } from "lucide-react"

export default function GaransiDetailPage() {
  const router = useRouter()
  const params = useParams()
  const transactionId = params?.id as string
  const { toast } = useToast()

  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [panelData, setPanelData] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [locked, setLocked] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // Ambil data transaksi
  useEffect(() => {
    async function fetchData() {
      const trx = await getTransactionById(transactionId)
      if (!trx) {
        toast({
          title: "Transaksi tidak ditemukan",
          description: "ID transaksi tidak valid.",
          variant: "destructive",
        })
        router.push("/garansi")
        return
      }

      if (trx.status !== "completed") {
        toast({
          title: "Transaksi belum selesai",
          description: "Selesaikan pembayaran terlebih dahulu sebelum klaim garansi.",
          variant: "destructive",
        })
        router.push("/garansi")
        return
      }

      setTransaction(trx)
      setLoading(false)
    }

    fetchData()
  }, [transactionId, router, toast])

  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@")
    return name.slice(0, 2) + "****@" + domain
  }

  const handleVerifyEmail = async () => {
  if (!transaction) return
  if (locked) return setError("Terlalu banyak percobaan, coba lagi nanti.")
  if (!email.trim()) return setError("Masukkan email terlebih dahulu.")

  setVerifying(true)
  setError("")

  try {
    if (email.trim().toLowerCase() !== transaction.email.toLowerCase()) {
      const failCount = attempts + 1
      setAttempts(failCount)

      if (failCount >= 3) {
        setLocked(true)
        return setError("Form dikunci karena 3x gagal. Coba lagi dalam 5 menit.")
      }

      return setError("Email tidak sesuai dengan transaksi ini.")
    }

    // ✅ Ambil data plan dari daftar plans
    const plan = plans.find((p) => p.id === transaction.planId)
    if (!plan) {
      return setError("Plan tidak ditemukan, hubungi admin.")
    }

// Cek apakah user/email sudah ada di panel
    const check = await checkUserExists(
  transaction.username,
  email,
  transaction.serverType
)
    if (!check.success) throw new Error("Gagal memeriksa pengguna di panel")

    if (check.usernameExists || check.emailExists) {
      setError("Akun panel masih aktif. Garansi belum bisa digunakan.")
      return
    }

    // ✅ Gunakan data dari plan, bukan dari transaksi
    const panel = await createPanel({
  username: transaction.username,
  email,
  memory: plan.memory,
  disk: plan.disk,
  cpu: plan.cpu,
  planId: transaction.planId,
  createdAt: transaction.createdAt,
  serverType: transaction.serverType,
  accessType: transaction.accessType,
})

    if (!panel.success) throw new Error("Gagal membuat panel baru")

    await updateTransactionReplace(transactionId)

    setPanelData({
      username: transaction.username,
      password: panel.password,
      serverId: panel.serverId,
    })

    toast({
      title: "Garansi berhasil diproses",
      description: "Panel baru berhasil dibuat dan detail dikirim ke email kamu.",
    })
  } catch (err: any) {
    console.error(err)
    setError(err.message || "Terjadi kesalahan saat memproses garansi.")
  } finally {
    setVerifying(false)
  }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Memuat detail garansi...
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-dark-500 border border-dark-300 rounded-2xl shadow-lg">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-bold text-center text-white mb-6 flex justify-center items-center gap-2"
      >
        <ShieldCheck className="w-6 h-6 text-red-500" />
        Klaim Garansi Panel
      </motion.h1>

      <Card className="bg-dark-400 border-dark-300 mb-5">
        <CardContent className="p-5 space-y-3 text-sm text-gray-300">
          <p><strong>ID Transaksi:</strong> {transactionId}</p>
          <p><strong>Paket:</strong> {transaction.planName}</p>
          <p><strong>Email:</strong> {maskEmail(transaction.email)}</p>
          <p><strong>Status:</strong> <span className="text-green-400">Completed</span></p>
        </CardContent>
      </Card>

      {!panelData ? (
        <div className="space-y-4">
          <Label htmlFor="email" className="text-base text-gray-200">
            Verifikasi Email
          </Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email terdaftar"
            className="h-14 text-base bg-dark-400 border-dark-300 focus:border-red-500 focus:ring-red-500"
            disabled={verifying || locked}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            onClick={handleVerifyEmail}
            className="w-full h-14 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-lg font-medium"
            disabled={verifying || locked}
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Klaim Garansi"
            )}
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark-400 border border-dark-300 p-5 rounded-xl space-y-3 mt-4"
        >
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-red-500" /> Panel Baru Dibuat
          </h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>
  <strong>Type:</strong>{" "}
  {transaction.serverType === "private" ? "Private Panel" : "Public Panel"}
</p>
<p>
  <strong>Role:</strong>{" "}
  {transaction.accessType === "admin" ? "Admin" : "Reguler"}
</p>
            <p><strong>Username:</strong> {panelData.username}</p>
            <p><strong>Password:</strong> {panelData.password}</p>
            <p><strong>Server ID:</strong> {panelData.serverId}</p>
          </div>
        </motion.div>
      )}

      <div className="text-center text-gray-400 text-xs mt-6 flex items-center justify-center gap-1">
        <AlertTriangle className="w-4 h-4" />
        Garansi berlaku {appConfig.garansi.warrantyDays} hari & maksimal {appConfig.garansi.replaceLimit} kali penggantian.
      </div>
    </div>
  )
}
