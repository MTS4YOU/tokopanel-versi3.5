"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "Apa itu panel Pterodactyl?",
    answer:
      "Pterodactyl adalah platform manajemen server open-source berbasis website yang memungkinkan Anda untuk mengelola server game, dan server bot dengan mudah.",
  },
  {
    question: "Apa kegunaan panel bot Pterodactyl?",
    answer:
      "Panel bot Pterodactyl memudahkan untuk menjalankan program bot pada WhatsApp dan Telegram.",
  },
  {
    question: "Apa keuntungannya menggunakan panel bot Pterodactyl?",
    answer: 
      "Mempermudah dan membuat peforma bot anda lebih stabil, dan tidak akan memakan kuota internet serta ruang penyimpanan pada device anda.",
  },
  { 
    question: "Bagaimana cara claim garansi?",
    answer: "Anda bisa click pada short menu di pojok kanan atas, dan anda memerlukan ID transaksi serta alamat email yang tercantum pada halaman Riwayat Transaksi.",
  },
  {
  question: "Mengapa saya tidak bisa membeli dua panel dengan email yang sama?",
  answer: "Sistem Pterodactyl tidak mengizinkan penggunaan email atau username yang sama untuk lebih dari satu akun. Hal ini dilakukan untuk mencegah konflik data antar akun dan menjaga integritas sistem panel.",
  },
  {
  question: "Apa perbedaan antara panel Publik dan panel Private?",
  answer: "Panel Private menawarkan tingkat keamanan yang lebih tinggi, performa server yang lebih stabil, serta sumber daya (RAM dan CPU) yang tidak mudah terpakai oleh pengguna lain. Panel ini sangat cocok bagi kamu yang membutuhkan performa maksimal dan uptime tinggi. Sementara itu, Panel Publik lebih terjangkau namun berbagi resource dengan pengguna lain, sehingga cocok untuk kebutuhan ringan dan percobaan.",
  },
  {
  question: "Bagaimana jika saya lupa password panel?",
  answer: "Silakan klik tombol 'Forgot Password' yang terdapat di bawah form login Pterodactyl, lalu masukkan email panel yang kamu gunakan. Jika email tersebut terdaftar, sistem akan otomatis mengirimkan link reset password ke email tersebut. Karena itu, kami sangat menyarankan untuk selalu menggunakan email aktif saat membeli panel agar proses pemulihan akun lebih mudah.",
  }
]

function FAQItem({
  faq,
  index,
  openIndex,
  toggleFAQ,
}: {
  faq: { question: string; answer: string }
  index: number
  openIndex: number | null
  toggleFAQ: (index: number) => void
}) {
  const isOpen = openIndex === index

  return (
    <div
      className={`bg-dark-400 border ${
        isOpen ? "border-red-500/50" : "border-dark-300"
      } rounded-xl p-4 transition-all duration-300`}
    >
      <button
        onClick={() => toggleFAQ(index)}
        className="flex justify-between items-center w-full text-left text-white font-semibold text-lg"
      >
        {faq.question}
        <ChevronDown
          className={`w-5 h-5 transform transition-transform duration-200 ${
            isOpen ? "rotate-180 text-red-500" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden text-gray-300 text-sm mt-2"
          >
            {faq.answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggleFAQ = (index: number) =>
    setOpenIndex(openIndex === index ? null : index)

  return (
  <section id="faq" className="py-16 bg-dark-500 border-t border-dark-300">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-white mb-4"
        >
          <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Pertanyaan Umum
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-gray-300 max-w-2xl mx-auto mb-8"
        >
          Masih bingung? Berikut adalah beberapa pertanyaan yang sering ditanyakan oleh pengguna kami.
        </motion.p>

        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              openIndex={openIndex}
              toggleFAQ={toggleFAQ}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
