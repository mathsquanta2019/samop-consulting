import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, PlaneIcon } from "@/components/icons"
import Link from "next/link"

const features = [
  "Visa eligibility assessment",
  "Document checklist preparation",
  "Application form assistance",
  "Financial documentation guidance",
  "Interview preparation coaching",
  "Mock visa interview sessions",
  "Appointment scheduling support",
  "Post-visa travel guidance",
]

const visaTypes = [
  {
    title: "Student Visa (F-1/J-1)",
    country: "USA",
    description: "For full-time students enrolled in accredited institutions",
  },
  {
    title: "Tier 4 Student Visa",
    country: "UK",
    description: "For students studying at registered UK institutions",
  },
  {
    title: "Study Permit",
    country: "Canada",
    description: "For international students at designated learning institutions",
  },
  {
    title: "Student Visa (Subclass 500)",
    country: "Australia",
    description: "For students enrolled in registered courses",
  },
]

export default function VisaProcessingPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <PlaneIcon className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">Visa Processing</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                End-to-end visa application support with document preparation, interview coaching, and real-time updates
                throughout the process.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/client/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link href="/#contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Our Visa Services</h2>
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
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Visa Types We Handle</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {visaTypes.map((visa, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-secondary/20 text-secondary rounded">
                        {visa.country}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{visa.title}</h3>
                    <p className="text-muted-foreground">{visa.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Need Visa Assistance?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Our visa experts have helped thousands of students successfully obtain their study visas. Let us help you
              too.
            </p>
            <Link href="/client/login">
              <Button size="lg" variant="secondary">
                Start Application
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
