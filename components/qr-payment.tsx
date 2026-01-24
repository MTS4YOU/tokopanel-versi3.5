"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRupiah, formatDate } from "@/lib/utils"
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, QrCode } from "lucide-react"
import { checkPaymentStatus } from "@/app/actions/check-payment"
import { StatusModal } from "./status-modal"
import { WhatsappGroupPopup } from "./whatsapp-group-popup"
import { CopyButton } from "./copy-button"
import { pterodactylConfig } from "@/data/config"
import { motion } from "framer-motion"
import { plans } from "@/data/plans"

interface QrPaymentProps {
  transactionId: string
  amount: number
  fee: number
  total: number
  qrImageUrl: string
  expirationTime: string
  status: "pending" | "paid" | "completed" | "failed"
  username: string
  email: string
  planId: string
  createdAt: string
}

export function QrPayment({
  transactionId,
  amount,
  fee,
  total,
  qrImageUrl,
  expirationTime,
  status: initialStatus,
  username,
  email,
  planId,
  createdAt,
}: QrPaymentProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isChecking, setIsChecking] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"success" | "error" | "info" | "loading">("info")
  const [modalTitle, setModalTitle] = useState("")
  const [modalMessage, setModalMessage] = useState("")
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false)
  const [panelDetails, setPanelDetails] = useState<{
    username: string
    password: string
    serverId: number
    serverType: "public" | "private"
  } | null>(null)

  // Get plan name from planId
  const getPlanName = (id: string) => {
    const plan = plans.find((p) => p.id === id)
    return plan ? plan.name : "Unknown"
  }

  const saveTransactionToHistory = (status: "pending" | "paid" | "completed" | "failed", details?: any) => {
    try {
      const existingHistory = localStorage.getItem("transactionHistory")
      let history = existingHistory ? JSON.parse(existingHistory) : []

      const existingIndex = history.findIndex((t: any) => t.transactionId === transactionId)

      const planName = getPlanName(planId)

      const transaction = {
        transactionId,
        username,
        email,
        planId,
        planName,
        total,
        createdAt,
        status,
        panelDetails: details || undefined,
      }

      if (existingIndex !== -1) {
        history[existingIndex] = transaction
      } else {
        history.unshift(transaction)
      }

      if (history.length > 20) {
        history = history.slice(0, 20)
      }

      localStorage.setItem("transactionHistory", JSON.stringify(history))
    } catch (error) {
      console.error("Error saving transaction to history:", error)
    }
  }

  useEffect(() => {
    saveTransactionToHistory(initialStatus)
  }, [])

  const checkStatus = async () => {
    if (status === "completed") {
      setModalType("success")
      setModalTitle("Pembayaran Berhasil")
      setModalMessage("Panel Anda telah berhasil dibuat.")
      setShowModal(true)
      return
    }

    setIsChecking(true)
    try {
      const result = await checkPaymentStatus(transactionId)

      if (result.success) {
        if (result.status === "completed") {
          setStatus("completed")
          setPanelDetails(result.panelDetails || null)
          setModalType("success")
          setModalTitle("Pembayaran Berhasil")
          setModalMessage("Panel Anda telah berhasil dibuat dan detail akun telah dikirim ke email Anda.")
          setShowModal(true)

          saveTransactionToHistory("completed", result.panelDetails)

          if (result.showWhatsappPopup) {
            setTimeout(() => {
              setShowWhatsappPopup(true)
            }, 1000)
          }
        } else if (result.status === "paid") {
          setStatus("paid")
          setModalType("info")
          setModalTitle("Pembayaran Diterima")
          setModalMessage("Pembayaran Anda telah diterima. Panel sedang dalam proses pembuatan.")
          setShowModal(true)

          saveTransactionToHistory("paid")
        } else {
          setModalType("info")
          setModalTitle("Pembayaran Dalam Proses")
          setModalMessage("Pembayaran masih dalam proses. Silahkan coba lagi nanti.")
          setShowModal(true)
        }
      } else {
        setModalType("error")
        setModalTitle("Gagal Memeriksa Status")
        setModalMessage(result.error || "Gagal memeriksa status pembayaran")
        setShowModal(true)
      }
    } catch (error) {
      setModalType("error")
      setModalTitle("Terjadi Kesalahan")
      setModalMessage("Gagal memeriksa status pembayaran")
      setShowModal(true)
    } finally {
      setIsChecking(false)
    }
  }

  const panelDomain =
  panelDetails?.serverType === "private"
    ? pterodactylConfig.private.domain
    : pterodactylConfig.public.domain
  
  useEffect(() => {
    if (status === "pending") {
      const interval = setInterval(async () => {
        try {
          const result = await checkPaymentStatus(transactionId)
          if (result.success) {
            if (result.status === "completed") {
              setStatus("completed")
              setPanelDetails(result.panelDetails || null)

              saveTransactionToHistory("completed", result.panelDetails)

              if (result.showWhatsappPopup) {
                setTimeout(() => {
                  setShowWhatsappPopup(true)
                }, 1000)
              }
            } else if (result.status === "paid") {
              setStatus("paid")

              saveTransactionToHistory("paid")
            }
          }
        } catch (error) {
          console.error("Error checking payment status:", error)
        }
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [status, transactionId])

  const expiration = new Date(expirationTime)
  const isExpired = new Date() > expiration

  return (
    <div className="space-y-6 relative">
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        panelDetails={panelDetails}
      />

      <WhatsappGroupPopup isOpen={showWhatsappPopup} onClose={() => setShowWhatsappPopup(false)} />

      {status === "pending" && !isExpired && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="overflow-hidden bg-dark-400 border-dark-300">
            <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <h3 className="font-medium">Scan QR Code untuk Pembayaran</h3>
                </div>
                <p className="text-sm text-gray-300">Expired: {formatDate(expirationTime)}</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md border border-dark-300 mx-auto md:mx-0">
                  <Image
                    src={qrImageUrl || "/placeholder.svg"}
                    alt="QR Code Pembayaran"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>

                <div className="flex-1 space-y-6">
                  <div className="bg-dark-500 p-4 rounded-lg border border-dark-300">
                    <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Ringkasan Pembayaran</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Harga Paket:</span>
                        <span className="text-white">{formatRupiah(amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Biaya Admin:</span>
                        <span className="text-white">{formatRupiah(fee)}</span>
                      </div>
                      <div className="h-px bg-dark-300 my-3"></div>
                      <div className="flex justify-between font-medium">
                        <span className="text-white">Total Pembayaran:</span>
                        <span className="text-red-400">{formatRupiah(total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dark-500 p-4 rounded-lg border border-dark-300">
                    <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Instruksi</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                      <li>Buka aplikasi e-wallet atau m-banking Anda</li>
                      <li>Pilih menu scan QR Code atau QRIS</li>
                      <li>Scan QR Code di samping</li>
                      <li>Masukkan nominal sesuai total pembayaran</li>
                      <li>Selesaikan pembayaran</li>
                      <li>Klik tombol "Cek Status Pembayaran" di bawah</li>
                    </ol>
                  </div>

                  <Button
                    onClick={checkStatus}
                    disabled={isChecking}
                    className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Memeriksa Pembayaran...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Cek Status Pembayaran
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {status === "paid" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-dark-300 bg-dark-400">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4">
              <h3 className="font-medium flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Pembayaran Diterima
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-300">
                  Pembayaran Anda telah diterima. Panel Pterodactyl Anda sedang dalam proses pembuatan.
                </p>
              </div>

              <div className="bg-dark-500 p-4 rounded-lg border border-dark-300 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  <p className="text-gray-300">Mohon tunggu sebentar...</p>
                </div>
              </div>

              <div className="text-center text-sm text-gray-400">
                <p>Halaman akan diperbarui secara otomatis setelah panel selesai dibuat.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {status === "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-dark-300 bg-dark-400">
            <div className="bg-gradient-to-r from-green-800 to-green-900 text-white p-4">
              <h3 className="font-medium flex items-center justify-center">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Pembayaran Berhasil
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-300">
                  Terima kasih atas pembelian Anda. Panel Pterodactyl Anda telah berhasil dibuat dan detail akun telah
                  dikirim ke email Anda.
                </p>
              </div>

              {panelDetails && (
                <div className="bg-dark-500 p-4 rounded-lg border border-dark-300 mb-4">
                  <h4 className="font-medium text-white mb-3">Detail Panel</h4>

                  <div className="space-y-3">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-sm">URL Panel:</span>
                        <CopyButton text={panelDomain} />
                      </div>
                      <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono break-all">
                        {panelDomain}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-sm">Username:</span>
                        <CopyButton text={panelDetails.username} />
                      </div>
                      <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono">
                        {panelDetails.username}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-sm">Password:</span>
                        <CopyButton text={panelDetails.password} />
                      </div>
                      <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono">
                        {panelDetails.password}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-sm">Server ID:</span>
                        <CopyButton text={panelDetails.serverId.toString()} />
                      </div>
                      <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono">
                        {panelDetails.serverId}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <a
                      href={panelDomain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Login Sekarang
                    </a>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-400">
                <p>Detail akun juga telah dikirim ke email Anda. Silahkan login ke panel dengan kredensial di atas.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {status === "failed" && (
        <Card className="overflow-hidden border-dark-300 bg-dark-400">
          <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-4">
            <h3 className="font-medium flex items-center justify-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Pembayaran Gagal
            </h3>
          </div>
          <CardContent className="p-6 text-center">
            <p className="text-gray-300 mb-4">
              Maaf, pembayaran Anda gagal diproses. Silahkan coba lagi atau hubungi customer service kami.
            </p>
            <Button onClick={() => (window.location.href = "/")} className="bg-red-600 hover:bg-red-700 h-12">
              Kembali ke Halaman Utama
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "pending" && isExpired && (
        <Card className="overflow-hidden border-dark-300 bg-dark-400">
          <div className="bg-gradient-to-r from-yellow-700 to-yellow-900 text-white p-4">
            <h3 className="font-medium flex items-center justify-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Pembayaran Kedaluwarsa
            </h3>
          </div>
          <CardContent className="p-6 text-center">
            <p className="text-gray-300 mb-4">
              Maaf, waktu pembayaran Anda telah habis. Silahkan coba lagi dengan membuat pesanan baru.
            </p>
            <Button onClick={() => (window.location.href = "/")} className="bg-yellow-600 hover:bg-yellow-700 h-12">
              Buat Pesanan Baru
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
