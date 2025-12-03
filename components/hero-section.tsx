import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, CheckCircle } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 lg:py-32">
      <div className="absolute inset-0 bg-[url('/world-map-subtle-pattern.jpg')] opacity-5" />
      <div className="container relative mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-sm font-medium text-secondary mb-6">
              <CheckCircle className="h-4 w-4" />
              100% Success Rate in Immigration Consulting
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl text-balance">
              Your Gateway to Global Education
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Expert consulting for students seeking admission into Bachelor's, Master's, and PhD programmes in Europe,
              USA, Canada, Australia, and beyond. We guide you through every step of your journey.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="#book">
                <Button
                  size="lg"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto"
                >
                  Book Free Consultation
                </Button>
              </Link>
              <Link href="#services">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto bg-transparent"
                >
                  Explore Services
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-primary-foreground/70">
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">500+</p>
                <p className="text-sm">Students Helped</p>
              </div>
              <div className="h-12 w-px bg-primary-foreground/20" />
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">15+</p>
                <p className="text-sm">Countries</p>
              </div>
              <div className="h-12 w-px bg-primary-foreground/20" />
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">98%</p>
                <p className="text-sm">Visa Success</p>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img src="/diverse-students-graduation-celebration.jpg" alt="Students celebrating graduation" className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                  <GraduationCap className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">Trusted Partner</p>
                  <p className="text-sm text-muted-foreground">For your education journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
