"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, GraduationCapIcon, DollarSignIcon, ClockIcon } from "@/components/icons"
import { BookingModal } from "@/components/booking-modal"

const highlights = [
  "7 universities in global top 100",
  "Post-study work visa 2-4 years",
  "High standard of living",
  "Excellent weather and lifestyle",
  "Strong economy with job opportunities",
  "Welcoming multicultural society",
]

const topUniversities = [
  { name: "University of Melbourne", location: "Melbourne, Victoria" },
  { name: "University of Sydney", location: "Sydney, NSW" },
  { name: "Australian National University", location: "Canberra, ACT" },
  { name: "University of Queensland", location: "Brisbane, Queensland" },
  { name: "UNSW Sydney", location: "Sydney, NSW" },
  { name: "Monash University", location: "Melbourne, Victoria" },
]

const quickFacts = [
  { icon: GraduationCapIcon, label: "Universities", value: "43" },
  { icon: DollarSignIcon, label: "Avg. Tuition/Year", value: "AUD 20K-45K" },
  { icon: ClockIcon, label: "Visa Processing", value: "4-6 weeks" },
]

export default function AustraliaDestinationPage() {
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Header />
      <main>
        <section className="py-20 bg-gradient-to-b from-yellow-50 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="text-6xl mb-6">🇦🇺</div>
              <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">Study in Australia</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Australia combines world-class education with an exceptional lifestyle, offering excellent post-study
                work opportunities and pathways to migration.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowBookingModal(true)}>
                  Book Consultation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                  onClick={() => (window.location.href = "/#contact")}
                >
                  Get Guidance
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              {quickFacts.map((fact, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <fact.icon className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">{fact.value}</p>
                    <p className="text-sm text-muted-foreground">{fact.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Why Study in Australia?</h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card">
                  <CheckIcon className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Top Universities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {topUniversities.map((uni, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground">{uni.name}</h3>
                    <p className="text-sm text-muted-foreground">{uni.location}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Discover Australia</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Let our Australia specialists help you choose the right university and guide you through the student visa
              process.
            </p>
            <Button size="lg" variant="secondary" onClick={() => setShowBookingModal(true)}>
              Book Your Appointment
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <BookingModal open={showBookingModal} onOpenChange={setShowBookingModal} />
    </>
  )
}
