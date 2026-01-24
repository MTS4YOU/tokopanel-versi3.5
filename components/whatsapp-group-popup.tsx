"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { appConfig } from "@/data/config"

interface WhatsappGroupPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function WhatsappGroupPopup({ isOpen, onClose }: WhatsappGroupPopupProps) {
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

  const handleJoin = () => {
    window.open(appConfig.whatsappGroupLink, "_blank")
    handleClose()
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
          <div className="bg-green-900/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-500"
                >
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                  <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                  <path d="M9.5 13.5c.5 1 1.5 1.5 2.5 1.5s2-.5 2.5-1.5" />
                </svg>
                <h3 className="text-lg font-medium text-white">Gabung Grup WhatsApp</h3>
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
            <p className="mb-4 text-gray-300">
              Bergabunglah dengan grup WhatsApp kami untuk mendapatkan informasi terbaru, dukungan, dan tips seputar
              panel Pterodactyl Anda.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="bg-dark-500 border-dark-300 hover:bg-dark-600 text-white"
              >
                Nanti Saja
              </Button>
              <Button onClick={handleJoin} className="bg-green-600 hover:bg-green-700">
                Gabung Sekarang
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
