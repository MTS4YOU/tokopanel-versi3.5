"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDate, formatRupiah } from "@/lib/utils"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  Package,
  Trash2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import { pterodactylConfig } from "@/data/config"
import { plans } from "@/data/plans"
import { getTransactionById } from "@/app/actions/get-transactions"

interface TransactionHistory {
  transactionId: string
  username: string
  email: string
  planId: string
  planName: string
  total: number
  createdAt: string
  status: "completed" | "pending" | "paid" | "failed"
  panelDetails?: {
    username: string
    password: string
    serverId: number
    serverType?: "public" | "private"
  }
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistory | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null)
  const [loadingTransactions, setLoadingTransactions] = useState<{[key: string]: boolean}>({})
  const router = useRouter()

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const storedTransactions = localStorage.getItem("transactionHistory")
        if (storedTransactions) {
          let history = JSON.parse(storedTransactions)
          
          // Load all transactions from database
          const updatedTransactions: TransactionHistory[] = []
          
          for (const transaction of history) {
            try {
              const dbTransaction = await getTransactionById(transaction.transactionId)
              
              if (dbTransaction) {
                // Use data from database, fallback to local data
                const updatedTransaction: TransactionHistory = {
                  transactionId: dbTransaction.transactionId || transaction.transactionId,
                  username: dbTransaction.username || transaction.username,
                  email: dbTransaction.email || transaction.email,
                  planId: dbTransaction.planId || transaction.planId,
                  planName: dbTransaction.planName || transaction.planName,
                  total: dbTransaction.total || transaction.total,
                  createdAt: dbTransaction.createdAt || transaction.createdAt,
                  status: dbTransaction.status || transaction.status,
                  panelDetails: transaction.panelDetails // Keep panel details from local
                }
                updatedTransactions.push(updatedTransaction)
              } else {
                // If not found in DB, use local data and try to fix plan name
                if (!transaction.planName || transaction.planName === "Unknown" || transaction.planName === "Unknown Plan") {
                  const plan = plans.find((p) => p.id === transaction.planId)
                  if (plan) {
                    transaction.planName = plan.name
                  }
                }
                updatedTransactions.push(transaction)
              }
            } catch (error) {
              console.error(`Error loading transaction ${transaction.transactionId}:`, error)
              // Use local data as fallback
              if (!transaction.planName || transaction.planName === "Unknown" || transaction.planName === "Unknown Plan") {
                const plan = plans.find((p) => p.id === transaction.planId)
                if (plan) {
                  transaction.planName = plan.name
                }
              }
              updatedTransactions.push(transaction)
            }
          }
          
          setTransactions(updatedTransactions)
        }
      } catch (error) {
        console.error("Error loading transaction history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const handleViewDetails = async (transaction: TransactionHistory) => {
    setLoadingDetails(transaction.transactionId)
    try {
      // Fetch latest transaction data from database
      const dbTransaction = await getTransactionById(transaction.transactionId)
      
      if (dbTransaction) {
        // Merge local data with database data
        const updatedTransaction: TransactionHistory = {
          ...transaction,
          email: dbTransaction.email || transaction.email,
          planId: dbTransaction.planId || transaction.planId,
          planName: dbTransaction.planName || transaction.planName,
          total: dbTransaction.total || transaction.total,
          createdAt: dbTransaction.createdAt || transaction.createdAt,
          status: dbTransaction.status || transaction.status,
          // Keep existing panelDetails if not available from DB
          panelDetails: transaction.panelDetails
        }
        
        setSelectedTransaction(updatedTransaction)
      } else {
        // If not found in DB, use local data
        setSelectedTransaction(transaction)
      }
      setShowDetails(true)
      setShowSensitiveData(false)
    } catch (error) {
      console.error("Error fetching transaction details:", error)
      // Fallback to local data if DB fetch fails
      setSelectedTransaction(transaction)
      setShowDetails(true)
      setShowSensitiveData(false)
    } finally {
      setLoadingDetails(null)
    }
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedTransaction(null)
    setShowSensitiveData(false)
  }

  const toggleSensitiveData = () => {
    setShowSensitiveData(!showSensitiveData)
  }

  const handleClearHistory = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat transaksi?")) {
      localStorage.removeItem("transactionHistory")
      setTransactions([])
    }
  }

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string) => {
    try {
      // Handle ISO format and other date formats
      let date: Date
      
      // Check if it's already a valid Date object
      if (dateString instanceof Date) {
        date = dateString
      } 
      // Check if it's an ISO string
      else if (typeof dateString === 'string') {
        // Try parsing as ISO string first
        date = new Date(dateString)
        
        // If invalid, try other common formats
        if (isNaN(date.getTime())) {
          // Try removing timezone info and parse
          const withoutTimezone = dateString.replace(/[A-Z]/gi, ' ').trim()
          date = new Date(withoutTimezone)
          
          // If still invalid, return fallback
          if (isNaN(date.getTime())) {
            return "Tanggal tidak valid"
          }
        }
      } else {
        return "Tanggal tidak valid"
      }
      
      return formatDate(date)
    } catch (error) {
      console.error("Error formatting date:", error, dateString)
      return "Tanggal tidak valid"
    }
  }

  // Helper function to mask sensitive data
  const maskData = (text: string) => {
    if (!showSensitiveData) {
      return text.replace(/./g, "•")
    }
    return text
  }

  // Domain config panel 
  const getPanelDomain = (serverType?: "public" | "private") => {
  if (serverType === "private") {
    return pterodactylConfig.private.domain
  }
  return pterodactylConfig.public.domain
  }

  // Refresh single transaction from database
  const refreshTransaction = async (transactionId: string) => {
    setLoadingTransactions(prev => ({...prev, [transactionId]: true}))
    try {
      const dbTransaction = await getTransactionById(transactionId)
      
      if (dbTransaction) {
        setTransactions(prev => prev.map(transaction => 
          transaction.transactionId === transactionId 
            ? {
                ...transaction,
                email: dbTransaction.email || transaction.email,
                planId: dbTransaction.planId || transaction.planId,
                planName: dbTransaction.planName || transaction.planName,
                total: dbTransaction.total || transaction.total,
                createdAt: dbTransaction.createdAt || transaction.createdAt,
                status: dbTransaction.status || transaction.status,
              }
            : transaction
        ))
      }
    } catch (error) {
      console.error(`Error refreshing transaction ${transactionId}:`, error)
    } finally {
      setLoadingTransactions(prev => ({...prev, [transactionId]: false}))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-500 via-dark-700 to-dark-900">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-red-400 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                    Riwayat Transaksi
                  </span>
                </h1>
                <p className="text-gray-300 mt-2">
                  Berikut adalah riwayat transaksi yang telah Anda lakukan di perangkat ini.
                </p>
              </div>
              {transactions.length > 0 && (
                <Button
                  variant="outline"
                  className="bg-dark-500 border-dark-300 text-white hover:bg-dark-600"
                  onClick={handleClearHistory}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Riwayat
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 bg-dark-400 border border-dark-300 rounded-lg">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-medium text-white mb-2">Memuat Riwayat...</h3>
              <p className="text-gray-400">Mohon tunggu sebentar sementara kami memuat riwayat transaksi Anda.</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 bg-dark-400 border border-dark-300 rounded-lg">
              <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Belum Ada Riwayat</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Anda belum memiliki riwayat transaksi di perangkat ini. Transaksi yang Anda lakukan akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {transactions.map((transaction) => (
                <Card key={transaction.transactionId} className="bg-dark-400 border-dark-300 overflow-hidden">
                  <div
                    className={`p-3 flex justify-between items-center ${
                      transaction.status === "completed"
                        ? "bg-gradient-to-r from-green-800 to-green-900"
                        : transaction.status === "pending"
                          ? "bg-gradient-to-r from-yellow-800 to-yellow-900"
                          : transaction.status === "paid"
                            ? "bg-gradient-to-r from-blue-800 to-blue-900"
                            : "bg-gradient-to-r from-red-800 to-red-900"
                    }`}
                  >
                    <h3 className="font-medium text-white flex items-center">
                      {transaction.status === "completed" ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Transaksi Sukses
                        </>
                      ) : transaction.status === "pending" ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Menunggu Pembayaran
                        </>
                      ) : transaction.status === "paid" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sedang Diproses
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Gagal
                        </>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-black/20 text-white px-2 py-1 rounded">
                        {safeFormatDate(transaction.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-black/30"
                        onClick={() => refreshTransaction(transaction.transactionId)}
                        disabled={loadingTransactions[transaction.transactionId]}
                      >
                        {loadingTransactions[transaction.transactionId] ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-dark-500 rounded-full">
                          <Mail className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <p className="font-medium text-white">{transaction.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-dark-500 rounded-full">
                          <Package className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Paket</p>
                          <p className="font-medium text-white">
                            {transaction.planName}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-dark-300 flex justify-between items-center">
                        <span className="text-red-400 font-medium">{formatRupiah(transaction.total)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-dark-500 border-dark-300 text-white"
                          onClick={() => handleViewDetails(transaction)}
                          disabled={loadingDetails === transaction.transactionId}
                        >
                          {loadingDetails === transaction.transactionId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Detail"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-dark-400 rounded-lg shadow-xl border border-dark-300 overflow-hidden">
            <div
              className={`p-4 ${
                selectedTransaction.status === "completed"
                  ? "bg-gradient-to-r from-green-800 to-green-900"
                  : selectedTransaction.status === "pending"
                    ? "bg-gradient-to-r from-yellow-800 to-yellow-900"
                    : selectedTransaction.status === "paid"
                      ? "bg-gradient-to-r from-blue-800 to-blue-900"
                      : "bg-gradient-to-r from-red-800 to-red-900"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white flex items-center">
                  {selectedTransaction.status === "completed" ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Transaksi Sukses
                    </>
                  ) : selectedTransaction.status === "pending" ? (
                    <>
                      <Clock className="w-5 h-5 mr-2" />
                      Menunggu Pembayaran
                    </>
                  ) : selectedTransaction.status === "paid" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sedang Diproses
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Gagal
                    </>
                  )}
                </h3>
                <button onClick={handleCloseDetails} className="text-white hover:text-gray-300 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Detail Transaksi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-500 p-4 rounded-lg border border-dark-300">
                    <div>
                      <p className="text-sm text-gray-400">ID Transaksi</p>
                      <p className="font-medium text-white">{selectedTransaction.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Tanggal</p>
                      <p className="font-medium text-white">{safeFormatDate(selectedTransaction.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium text-white">{selectedTransaction.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Paket</p>
                      <p className="font-medium text-white">
                        {selectedTransaction.planName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total</p>
                      <p className="font-medium text-red-400">{formatRupiah(selectedTransaction.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p className="font-medium text-white">
                        {selectedTransaction.status === "completed"
                          ? "Sukses"
                          : selectedTransaction.status === "pending"
                            ? "Menunggu Pembayaran"
                            : selectedTransaction.status === "paid"
                              ? "Sedang Diproses"
                              : "Gagal"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTransaction.status === "completed" && selectedTransaction.panelDetails && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm uppercase text-gray-400 font-medium">Detail Panel</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-dark-500 border-dark-300 text-white hover:bg-dark-600"
                        onClick={toggleSensitiveData}
                      >
                        {showSensitiveData ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Sembunyikan Data
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Tampilkan Data
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-dark-500 p-4 rounded-lg border border-dark-300">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-sm">URL Panel:</span>
                            <CopyButton text={getPanelDomain(selectedTransaction.panelDetails.serverType)} />
                          </div>
                          <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono break-all">
                            {getPanelDomain(selectedTransaction.panelDetails.serverType)}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-sm">Username:</span>
                            <CopyButton text={selectedTransaction.panelDetails.username} />
                          </div>
                          <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono">
                            {selectedTransaction.panelDetails.username}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-sm">Password:</span>
                            <CopyButton text={selectedTransaction.panelDetails.password} />
                          </div>
                          <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono">
                            {maskData(selectedTransaction.panelDetails.password)}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-sm">Server ID:</span>
                            <CopyButton text={selectedTransaction.panelDetails.serverId.toString()} />
                          </div>
                          <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono">
                            {selectedTransaction.panelDetails.serverId}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <a
                          href={getPanelDomain(selectedTransaction.panelDetails.serverType)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Login Sekarang
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleCloseDetails} className="bg-red-600 hover:bg-red-700">
                    Tutup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
    }
