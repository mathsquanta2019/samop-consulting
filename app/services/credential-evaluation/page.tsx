import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, AwardIcon } from "@/components/icons"
import Link from "next/link"

const features = [
  "WES (World Education Services) evaluation",
  "ECE (Educational Credential Evaluators) reports",
  "NACES member organization evaluations",
  "Course-by-course evaluation",
  "Document-by-document evaluation",
  "Express processing available",
  "Translation services",
  "Verification and authentication",
]

const evaluationTypes = [
  {
    title: "Document-by-Document",
    timeline: "5-7 business days",
    description: "Lists each credential with its U.S. equivalent",
    bestFor: "Employment, Immigration",
  },
  {
    title: "Course-by-Course",
    timeline: "7-10 business days",
    description: "Detailed breakdown of all courses and grades",
    bestFor: "Graduate School, Licensing",
  },
  {
    title: "Professional Report",
    timeline: "10-15 business days",
    description: "Comprehensive evaluation for professional licensing",
    bestFor: "Medical, Engineering, CPA",
  },
]

export default function CredentialEvaluationPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <AwardIcon className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">Credential Evaluation</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Get your international academic credentials evaluated by recognized organizations like WES and ECE for
                education, employment, or immigration purposes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/client/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Evaluation
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
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Our Evaluation Services</h2>
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
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Evaluation Types</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {evaluationTypes.map((type, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{type.title}</h3>
                    <p className="text-sm text-secondary font-medium mb-3">Timeline: {type.timeline}</p>
                    <p className="text-muted-foreground mb-4">{type.description}</p>
                    <p className="text-sm">
                      <span className="font-medium">Best for:</span> {type.bestFor}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Need Your Credentials Evaluated?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              We work with all major credential evaluation organizations to get your documents evaluated quickly and
              accurately.
            </p>
            <Link href="/client/login">
              <Button size="lg" variant="secondary">
                Start Evaluation
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
