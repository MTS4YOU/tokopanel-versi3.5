"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart } from "lucide-react"
import { appConfig } from "@/data/config"

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark-500"
        >
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="relative">
                <ShoppingCart className="w-20 h-20 text-red-500" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-red-700 rounded-full"
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold text-white mb-2"
            >
              <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">{appConfig.nameHost}</span>
            </motion.h1>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex space-x-2 mt-4"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0 }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.2 }}
                className="w-3 h-3 bg-red-600 rounded-full"
              />
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.4 }}
                className="w-3 h-3 bg-red-700 rounded-full"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
