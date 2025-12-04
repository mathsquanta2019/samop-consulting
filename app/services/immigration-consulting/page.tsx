"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, GlobeIcon } from "@/components/icons"
import { BookingModal } from "@/components/booking-modal"

const features = [
  "Comprehensive eligibility assessment",
  "Immigration pathway consultation",
  "Document preparation and review",
  "Application form assistance",
  "Status tracking and updates",
  "Interview preparation",
  "Appeal support if needed",
  "Post-arrival settlement guidance",
]

const immigrationTypes = [
  {
    title: "Work Immigration",
    description: "Employment-based immigration pathways for skilled professionals",
    examples: "H-1B, Skilled Worker Visa, Work Permits",
  },
  {
    title: "Family Immigration",
    description: "Family reunification and sponsorship applications",
    examples: "Family Visa, Spouse Visa, Dependent Visa",
  },
  {
    title: "Investment Immigration",
    description: "Business and investment-based immigration options",
    examples: "EB-5, Investor Visa, Start-up Visa",
  },
  {
    title: "Permanent Residency",
    description: "Pathways to permanent residence and citizenship",
    examples: "Green Card, PR Application, Citizenship",
  },
]

export default function ImmigrationConsultingPage() {
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Header />
      <main>
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <GlobeIcon className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">Immigration Consulting</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Expert immigration guidance with comprehensive eligibility assessment. We help you navigate complex
                immigration processes with confidence.
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
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Our Immigration Services</h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckIcon className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Immigration Categories</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {immigrationTypes.map((type, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{type.title}</h3>
                    <p className="text-muted-foreground mb-3">{type.description}</p>
                    <p className="text-sm text-secondary">{type.examples}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Ready to Start Your Immigration Journey?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Book a consultation with our immigration experts to discuss your options and create a personalized
              immigration plan.
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
