"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, Server, ShoppingBag } from "lucide-react"

interface StatsData {
  totalUsers: number
  totalServers: number
  totalPurchases: number
}

export function StatsSection() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalServers: 0,
    totalPurchases: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="py-16 bg-dark-500">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-white mb-12"
        >
          <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Statistik Kami</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard
            icon={<Users className="w-8 h-8 text-red-500" />}
            title="Total Pengguna"
            value={stats.totalUsers}
            delay={0.2}
          />
          <StatCard
            icon={<Server className="w-8 h-8 text-red-500" />}
            title="Total Server"
            value={stats.totalServers}
            delay={0.4}
          />
          <StatCard
            icon={<ShoppingBag className="w-8 h-8 text-red-500" />}
            title="Pembelian Sukses"
            value={stats.totalPurchases}
            delay={0.6}
          />
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
  delay: number
}

function StatCard({ icon, title, value, delay }: StatCardProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (value > 0) {
      let start = 0
      const increment = value / 30
      const timer = setInterval(() => {
        start += increment
        if (start > value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 50)
      return () => clearInterval(timer)
    }
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      className="bg-dark-400 rounded-lg p-6 border border-dark-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-red-500/30"
    >
      <div className="flex items-center justify-center mb-4">
        <div className="p-3 bg-dark-500 rounded-full">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold text-center text-white mb-2">{title}</h3>
      <p className="text-3xl font-bold text-center text-red-500">{count}</p>
    </motion.div>
  )
}
