"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, GraduationCapIcon, DollarSignIcon, ClockIcon } from "@/components/icons"
import { BookingModal } from "@/components/booking-modal"

const highlights = [
  "Home to 8 of the top 10 universities globally",
  "Optional Practical Training (OPT) for work experience",
  "Diverse range of programs and specializations",
  "Cutting-edge research opportunities",
  "Strong alumni networks and career support",
  "Cultural diversity and international exposure",
]

const topUniversities = [
  { name: "Massachusetts Institute of Technology (MIT)", location: "Cambridge, MA" },
  { name: "Stanford University", location: "Stanford, CA" },
  { name: "Harvard University", location: "Cambridge, MA" },
  { name: "California Institute of Technology", location: "Pasadena, CA" },
  { name: "University of Chicago", location: "Chicago, IL" },
  { name: "Columbia University", location: "New York, NY" },
]

const quickFacts = [
  { icon: GraduationCapIcon, label: "Universities", value: "4,000+" },
  { icon: DollarSignIcon, label: "Avg. Tuition/Year", value: "$20K-$55K" },
  { icon: ClockIcon, label: "Visa Processing", value: "3-5 weeks" },
]

export default function USADestinationPage() {
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Header />
      <main>
        <section className="py-20 bg-gradient-to-b from-blue-50 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="text-6xl mb-6">🇺🇸</div>
              <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">Study in USA</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                The United States is the world's leading destination for international students, offering unparalleled
                academic excellence, research opportunities, and career prospects.
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
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Why Study in USA?</h2>
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
            <h2 className="font-serif text-3xl font-bold mb-4">Start Your American Dream</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Let our experts guide you through the entire process - from university selection to visa approval.
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
