import { notFound } from "next/navigation"
import { getPayment } from "@/app/actions/create-payment"
import { InvoiceDetails } from "@/components/invoice-details"
import { QrPayment } from "@/components/qr-payment"
import { InvoiceHeader } from "@/components/invoice-header"
import { SocialMediaButton } from "@/components/social-media-button"

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const payment = await getPayment(params.id)

  if (!payment) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-500 via-dark-700 to-dark-900 pt-20">
      <InvoiceHeader />
      <SocialMediaButton />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                Invoice Pembayaran
              </span>
            </h1>
            <p className="text-gray-300">
              Silahkan selesaikan pembayaran Anda untuk melanjutkan proses pembuatan panel
            </p>
          </div>

          <div className="space-y-6">
            <InvoiceDetails
              transactionId={payment.transactionId}
              planId={payment.planId}
              username={payment.username}
              email={payment.email}
              amount={payment.amount}
              fee={payment.fee}
              total={payment.total}
              createdAt={payment.createdAt}
              status={payment.status}
            />

            <QrPayment
              transactionId={payment.transactionId}
              amount={payment.amount}
              fee={payment.fee}
              total={payment.total}
              qrImageUrl={payment.qrImageUrl}
              expirationTime={payment.expirationTime}
              status={payment.status}
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <span className="bubble" style={{ left: "10%", width: "40px", height: "40px", animationDelay: "0s" }}></span>
        <span className="bubble" style={{ left: "20%", width: "20px", height: "20px", animationDelay: "2s" }}></span>
        <span className="bubble" style={{ left: "50%", width: "60px", height: "60px", animationDelay: "5s" }}></span>
        <span className="bubble" style={{ left: "70%", width: "30px", height: "30px", animationDelay: "8s" }}></span>
        <span className="bubble" style={{ left: "90%", width: "50px", height: "50px", animationDelay: "11s" }}></span>
      </div>
    </div>
  )
}
