"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { getTransactionById } from "@/app/actions/get-transactions"
import { useRouter } from "next/navigation"
import { appConfig } from "@/data/config"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CalendarDays, FileSearch, Loader2, PackageCheck } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function GaransiPage() {
  const [transactionId, setTransactionId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [garansiData, setGaransiData] = useState<{
    planName: string
    amount: number
    remainingDays: number
    remainingReplace: number
    createdAt: string
  } | null>(null)
  const [dialogType, setDialogType] = useState<"error" | "expired" | "valid" | "incomplete" | "notfound">("valid")
  const router = useRouter()
  const { toast } = useToast()

  const handleCheckWarranty = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transactionId.trim()) {
      toast({
        title: "Error",
        description: "Masukkan ID Transaksi terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setShowDialog(false)
    setGaransiData(null)

    try {
      const transaction = await getTransactionById(transactionId.trim())

      if (!transaction) {
        setDialogType("notfound")
        setShowDialog(true)
        return
      }

      if (transaction.status !== "completed") {
        setDialogType("incomplete")
        setShowDialog(true)
        return
      }

      const purchaseDate = new Date(transaction.createdAt)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
      const remainingDays = appConfig.garansi.warrantyDays - diffDays
      const remainingReplace = appConfig.garansi.replaceLimit - (transaction.replaceUsed || 0)

      if (remainingDays <= 0 || remainingReplace <= 0) {
        setDialogType("expired")
        setShowDialog(true)
        return
      }

      setGaransiData({
        planName: transaction.planName,
        amount: transaction.amount,
        remainingDays,
        remainingReplace,
        createdAt: purchaseDate.toLocaleDateString(),
      })
      setDialogType("valid")
      setShowDialog(true)
    } catch (error) {
      setDialogType("error")
      setShowDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Navbar di atas */}
      <Navbar />

      {/* Konten utama */}
      <main className="min-h-screen flex flex-col justify-center items-center px-4 pt-32 pb-20 bg-dark-600">
        <div className="w-full max-w-lg p-6 bg-dark-500 border border-dark-300 rounded-2xl shadow-lg">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-bold text-center text-white mb-6 flex justify-center items-center gap-2"
          >
            <PackageCheck className="w-6 h-6 text-red-500" />
            Claim Garansi Panel
          </motion.h1>

          <form onSubmit={handleCheckWarranty} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="transactionId" className="text-base font-medium text-gray-200 flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-red-500" />
                ID Transaksi
              </Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Masukkan ID Transaksi"
                className="h-14 text-base bg-dark-400 border-dark-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 h-14 text-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                "Periksa Garansi"
              )}
            </Button>
          </form>

          {/* Dialog */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="sm:max-w-md bg-dark-400 border-dark-300 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl text-red-400">
                  {dialogType === "valid"
                    ? "Informasi Garansi"
                    : dialogType === "expired"
                    ? "Garansi Kadaluarsa"
                    : dialogType === "notfound"
                    ? "Transaksi Tidak Ditemukan"
                    : dialogType === "incomplete"
                    ? "Transaksi Belum Selesai"
                    : "Terjadi Kesalahan"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {dialogType === "valid"
                    ? "Garansi panel kamu masih aktif. Berikut detailnya:"
                    : dialogType === "expired"
                    ? "Masa garansi atau batas klaim sudah habis."
                    : dialogType === "notfound"
                    ? "ID transaksi tidak ditemukan dalam sistem."
                    : dialogType === "incomplete"
                    ? "Transaksi ini belum diselesaikan. Silakan selesaikan dulu pembayaranmu."
                    : "Tidak dapat memproses permintaan kamu."}
                </DialogDescription>
              </DialogHeader>

              {garansiData && dialogType === "valid" && (
                <div className="bg-dark-500 p-4 rounded-lg border border-dark-300 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Paket:</div>
                    <div className="font-medium text-white">{garansiData.planName}</div>
                    <div className="text-gray-400">Harga:</div>
                    <div className="font-medium text-red-400">{formatRupiah(garansiData.amount)}</div>
                    <div className="text-gray-400">Tanggal Pembelian:</div>
                    <div className="font-medium text-white">{garansiData.createdAt}</div>
                    <div className="text-gray-400">Sisa Garansi:</div>
                    <div className="font-medium text-white">{garansiData.remainingDays} hari</div>
                    <div className="text-gray-400">Sisa Klaim:</div>
                    <div className="font-medium text-white">{garansiData.remainingReplace} kali</div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="w-full sm:w-auto bg-dark-500 border-dark-300 hover:bg-dark-600 text-white"
                >
                  Tutup
                </Button>

                {dialogType === "valid" && (
                  <Button
                    onClick={() => router.push(`/garansi/${transactionId}`)}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                  >
                    Lanjutkan
                  </Button>
                )}

                {dialogType === "expired" && (
                  <Button onClick={() => router.push("/plans")} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                    Beli Lagi
                  </Button>
                )}

                {dialogType === "incomplete" && (
                  <Button
                    onClick={() => router.push(`/invoice/${transactionId}`)}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                  >
                    Selesaikan
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="text-center text-gray-400 text-sm mt-5 flex items-center justify-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Garansi berlaku {appConfig.garansi.warrantyDays} hari, maksimal{" "}
            {appConfig.garansi.replaceLimit} kali penggantian.
          </div>
        </div>
      </main>

      {/* Footer di bawah */}
      <Footer />
    </>
  )
}
