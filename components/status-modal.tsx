"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Clock, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopyButton } from "./copy-button"
import { pterodactylConfig } from "@/data/config"

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error" | "info" | "loading"
  title: string
  message: string
  panelDetails?: {
    username: string
    password: string
    serverId: number
  } | null
}

export function StatusModal({ isOpen, onClose, type, title, message, panelDetails }: StatusModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative z-50 w-full max-w-md overflow-hidden rounded-lg bg-dark-400 shadow-xl border border-dark-300"
        >
          <div
            className={`p-5 ${
              type === "success"
                ? "bg-green-900/20"
                : type === "error"
                  ? "bg-red-900/20"
                  : type === "loading"
                    ? "bg-blue-900/20"
                    : "bg-yellow-900/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {type === "success" ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : type === "error" ? (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                ) : type === "loading" ? (
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-500" />
                )}
                <h3 className="text-lg font-medium text-white">{title}</h3>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-1 text-gray-400 hover:bg-dark-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-5">
            <p className="mb-4 text-gray-300">{message}</p>

            {panelDetails && (
              <div className="mb-5 rounded-md bg-dark-500 p-4 border border-dark-300">
                <h4 className="mb-3 font-medium text-white">Detail Panel</h4>

                <div className="space-y-3">
                    <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-sm">URL Panel:</span>
                      <CopyButton text={pterodactylConfig.domain} />
                    </div>
                      <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono break-all">
                      {pterodactylConfig.domain}
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
                    href={pterodactylConfig.domain}
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

            <div className="flex justify-end">
              <Button
                onClick={handleClose}
                className={`${
                  type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : type === "error"
                      ? "bg-red-600 hover:bg-red-700"
                      : type === "loading"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                Tutup
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
