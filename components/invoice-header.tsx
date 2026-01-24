"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { appConfig } from "@/data/config"

export function InvoiceHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
        scrolled ? "bg-dark-400/80 backdrop-blur-md shadow-md border-b border-dark-300" : "bg-transparent",
      )}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className={cn("flex items-center space-x-2 transition-colors", scrolled ? "text-red-500" : "text-white")}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>

        <div className="flex items-center space-x-2">
          <ShoppingCart className={cn("w-6 h-6", scrolled ? "text-red-500" : "text-white")} />
          <span className={cn("text-lg font-bold transition-colors", scrolled ? "text-red-500" : "text-white")}>
            {appConfig.nameHost}
          </span>
        </div>
      </div>
    </header>
  )
}
