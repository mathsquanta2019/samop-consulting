import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { AboutSection } from "@/components/about-section"
import { CountriesSection } from "@/components/countries-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chat-bot"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <CountriesSection />
        <ContactSection />
      </main>
      <Footer />
      <ChatBot />
    </div>
  )
}
