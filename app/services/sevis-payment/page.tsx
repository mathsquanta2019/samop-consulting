import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, FileCheckIcon } from "@/components/icons"
import Link from "next/link"

const features = [
  "SEVIS I-901 fee payment processing",
  "Form I-20/DS-2019 verification",
  "Payment confirmation tracking",
  "Receipt generation and delivery",
  "Payment status updates",
  "Support for multiple payment methods",
  "Express processing available",
  "Dedicated customer support",
]

const feeTypes = [
  {
    title: "F-1 Student Visa",
    fee: "$350",
    description: "For students attending academic institutions",
  },
  {
    title: "M-1 Student Visa",
    fee: "$350",
    description: "For students in vocational programs",
  },
  {
    title: "J-1 Exchange Visitor",
    fee: "$220",
    description: "For exchange visitors and scholars",
  },
]

export default function SevisPaymentPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <FileCheckIcon className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">SEVIS Payment</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Seamless SEVIS I-901 fee payment assistance for US-bound students. We handle the entire payment process
                so you can focus on your journey.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/client/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Pay SEVIS Fee
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
            <h2 className="font-serif text-3xl font-bold text-center mb-12">What We Offer</h2>
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
            <h2 className="font-serif text-3xl font-bold text-center mb-12">SEVIS Fee Structure</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {feeTypes.map((type, index) => (
                <Card key={index} className="bg-card text-center">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{type.title}</h3>
                    <p className="text-3xl font-bold text-primary mb-2">{type.fee}</p>
                    <p className="text-muted-foreground text-sm">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              * Service fees may apply in addition to the SEVIS fee
            </p>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Ready to Pay Your SEVIS Fee?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Get your SEVIS fee paid quickly and securely. We provide confirmation within 24-48 hours.
            </p>
            <Link href="/client/login">
              <Button size="lg" variant="secondary">
                Start Payment
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
