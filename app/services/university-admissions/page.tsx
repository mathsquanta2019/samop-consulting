import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, GraduationCapIcon } from "@/components/icons"
import Link from "next/link"

const features = [
  "Personalized university shortlisting based on your profile",
  "Application strategy and timeline planning",
  "Statement of Purpose (SOP) writing and review",
  "Letters of Recommendation guidance",
  "Application form filling assistance",
  "Interview preparation and mock sessions",
  "Scholarship research and application support",
  "Post-admission support and guidance",
]

const levels = [
  {
    title: "Bachelor's Degree",
    description: "Undergraduate programs at top universities worldwide",
    requirements: ["High school diploma", "SAT/ACT scores", "English proficiency"],
  },
  {
    title: "Master's Degree",
    description: "Graduate programs for career advancement",
    requirements: ["Bachelor's degree", "GRE/GMAT scores", "Work experience (some programs)"],
  },
  {
    title: "PhD Programs",
    description: "Doctoral research opportunities",
    requirements: ["Master's degree", "Research experience", "Publications (preferred)"],
  },
]

export default function UniversityAdmissionsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <GraduationCapIcon className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">University Admissions</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Complete guidance for Bachelor's, Master's, and PhD admissions to top universities in USA, UK, Canada,
                Australia, and Europe.
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
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Education Levels</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {levels.map((level, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{level.title}</h3>
                    <p className="text-muted-foreground mb-4">{level.description}</p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Requirements:</p>
                      {level.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          {req}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have successfully gained admission to their dream universities with our
              guidance.
            </p>
            <Link href="/client/login">
              <Button size="lg" variant="secondary">
                Apply Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
