"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, History, FileText, Home, Users, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { appConfig } from "@/data/config"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
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

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const Path = (props: any) => (
    <motion.path
      fill="transparent"
      strokeWidth="2"
      stroke={scrolled ? "rgb(239, 68, 68)" : "white"}
      strokeLinecap="round"
      {...props}
    />
  )

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
        scrolled ? "bg-dark-400/80 backdrop-blur-md shadow-md border-b border-dark-300" : "bg-transparent",
      )}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <ShoppingCart className={cn("w-8 h-8", scrolled ? "text-red-500" : "text-white")} />
          <span className={cn("text-xl font-bold transition-colors", scrolled ? "text-red-500" : "text-white")}>
            {appConfig.nameHost}
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <NavLink href="/" label="Home" scrolled={scrolled} icon={<Home className="w-4 h-4 mr-1" />} />
          <NavLink href="/history" label="Riwayat" scrolled={scrolled} icon={<History className="w-4 h-4 mr-1" />} />
          <NavLink href="/garansi" label="Garansi" scrolled={scrolled} icon={<ShieldCheck className="w-4 h-4 mr-1" />} />
          
          <NavLink
            href={appConfig.whatsappGroupLink}
            label="Community"
            scrolled={scrolled}
            icon={<Users className="w-4 h-4 mr-1" />}
            external
          />
        </div>

        <button
          className={cn(
            "md:hidden focus:outline-none transition-colors z-50",
            scrolled ? "text-red-500" : "text-white",
          )}
          onClick={toggleMenu}
        >
          <svg width="23" height="23" viewBox="0 0 23 23">
            <Path
              variants={{
                closed: { d: "M 2 2.5 L 20 2.5" },
                open: { d: "M 3 16.5 L 17 2.5" },
              }}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
            />
            <Path
              d="M 2 9.423 L 20 9.423"
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 },
              }}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
            />
            <Path
              variants={{
                closed: { d: "M 2 16.346 L 20 16.346" },
                open: { d: "M 3 2.5 L 17 16.346" },
              }}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
            />
          </svg>
        </button>
      </div>

      <motion.div
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: {
            height: "auto",
            opacity: 1,
            transition: {
              height: { duration: 0.3 },
              opacity: { duration: 0.3, delay: 0.1 },
            },
          },
          closed: {
            height: 0,
            opacity: 0,
            transition: {
              height: { duration: 0.3 },
              opacity: { duration: 0.2 },
            },
          },
        }}
        className="md:hidden absolute top-full left-0 right-0 bg-dark-400 shadow-lg border-t border-dark-300 overflow-hidden"
      >
        <div className="flex flex-col p-4 space-y-3">
          <MobileNavLink
            href="/"
            label="Home"
            onClick={() => setIsOpen(false)}
            icon={<Home className="w-4 h-4 mr-2" />}
          />
          <MobileNavLink
            href="/history"
            label="Riwayat"
            onClick={() => setIsOpen(false)}
            icon={<History className="w-4 h-4 mr-2" />}
          />
          <MobileNavLink
            href="/garansi"
            label="Garansi"
            onClick={() => setIsOpen(false)}
            icon={<ShieldCheck className="w-4 h-4 mr-2" />}
          />
          <MobileNavLink
            href={appConfig.whatsappGroupLink}
            label="Community"
            onClick={() => setIsOpen(false)}
            icon={<Users className="w-4 h-4 mr-2" />}
            external
          />
        </div>
      </motion.div>
    </nav>
  )
}

function NavLink({
  href,
  label,
  scrolled,
  external = false,
  icon,
}: {
  href: string
  label: string
  scrolled: boolean
  external?: boolean
  icon?: React.ReactNode
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "font-medium transition-colors flex items-center",
          scrolled ? "text-gray-300 hover:text-red-400" : "text-gray-300 hover:text-red-400",
        )}
      >
        {icon && icon}
        {label}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        "font-medium transition-colors flex items-center",
        scrolled ? "text-gray-300 hover:text-red-400" : "text-gray-300 hover:text-red-400",
      )}
    >
      {icon && icon}
      {label}
    </Link>
  )
}

function MobileNavLink({
  href,
  label,
  onClick,
  external = false,
  icon,
}: {
  href: string
  label: string
  onClick: () => void
  external?: boolean
  icon?: React.ReactNode
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-300 font-medium py-2 hover:text-red-400 flex items-center"
        onClick={onClick}
      >
        {icon && icon}
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className="text-gray-300 font-medium py-2 hover:text-red-400 flex items-center" onClick={onClick}>
      {icon && icon}
      {label}
    </Link>
  )
}
