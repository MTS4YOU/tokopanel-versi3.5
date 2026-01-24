import PanelForm from "@/components/panel-form"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingScreen } from "@/components/loading-screen"
import { SocialMediaButton } from "@/components/social-media-button"
import { InfoSection } from "@/components/info-section"
import { StatsSection } from "@/components/stats-section"
import { Footer } from "@/components/footer"
import { FaqSection } from "@/components/faq"

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <div className="min-h-screen bg-gradient-to-br from-dark-500 via-dark-700 to-dark-900">
        <Navbar />
        <SocialMediaButton />

        <section className="min-h-screen flex items-center justify-center pt-16 pb-20 px-4">
          <div className="container mx-auto">
            <Card className="max-w-2xl mx-auto shadow-2xl border-dark-300 overflow-hidden animate-slide-up bg-dark-400">
              <div className="h-3 bg-gradient-to-r from-red-600 to-red-800"></div>
              <CardContent className="p-8">
                <PanelForm />
              </CardContent>
            </Card>
          </div>
        </section>

        <FaqSection />
        <InfoSection />
        <StatsSection />
        <Footer />

        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
          <span className="bubble" style={{ left: "10%", width: "40px", height: "40px", animationDelay: "0s" }}></span>
          <span className="bubble" style={{ left: "20%", width: "20px", height: "20px", animationDelay: "2s" }}></span>
          <span className="bubble" style={{ left: "50%", width: "60px", height: "60px", animationDelay: "5s" }}></span>
          <span className="bubble" style={{ left: "70%", width: "30px", height: "30px", animationDelay: "8s" }}></span>
          <span className="bubble" style={{ left: "90%", width: "50px", height: "50px", animationDelay: "11s" }}></span>
        </div>
      </div>
    </>
  )
}
