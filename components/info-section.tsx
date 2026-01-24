"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Shield, Zap, CalendarClock, Cpu, Clock, CreditCard } from "lucide-react"

export function InfoSection() {
  const features = [
    {
      icon: <Shield className="w-10 h-10 text-red-500" />,
      title: "KEAMANAN TERJAMIN",
      description: "Kami menjamin keamanan data dan privasi panel Anda dengan sistem keamanan terbaik.",
      delay: 0.2,
    },
    {
      icon: <Zap className="w-10 h-10 text-red-500" />,
      title: "PERFORMA SERVER",
      description: "Nikmati performa server 2.7GHz yang cepat dan stabil untuk menjalankan bot Anda tanpa kendala.",
      delay: 0.2,
    },
    {
      icon: <CalendarClock className="w-10 h-10 text-red-500" />,
      title: "MASA AKTIF PANEL",
      description: "Masa aktif panel hanya 1 bulan, dengan garansi aktif 12 hari (3× replace).",
      delay: 0.4,
    },
    {
      icon: <Cpu className="w-10 h-10 text-red-500" />,
      title: "SPESIFIKASI SERVER",
      description: "Server kami menggunakan VPS (RAM 32GB/16 CORE • NVMe 128GB) dan VPS kami legal di Indonesia.",
      delay: 0.4,
    },
    {
      icon: <Clock className="w-10 h-10 text-red-500" />,
      title: "UPTIME SERVER",
      description: "Kami menjamin panel anda akan aktif 24jam nonstop sehingga bot Anda akan selalu online dan dapat diakses.",
      delay: 0.6,
    },
    {
      icon: <CreditCard className="w-10 h-10 text-red-500" />,
      title: "PEMBAYARAN MUDAH",
      description: "Proses pembayaran yang mudah dan cepat dengan metode pembayaran QRIS all payment.",
      delay: 0.6,
    },
  ]

  return (
    <div className="py-16 bg-gradient-to-b from-dark-400 to-dark-500">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-white mb-4"
        >
          <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Mengapa Memilih Kami?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-gray-300 max-w-2xl mx-auto mb-12"
        >
          Kami menyediakan layanan panel bot Pterodactyl terbaik dengan kualitas terbaik dan harga terjangkau.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      className="bg-dark-400 rounded-lg p-6 border border-dark-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-red-500/30"
    >
      <div className="flex items-center mb-4">
        <div className="p-3 bg-dark-500 rounded-full mr-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  )
}
