"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckIcon, PlaneIcon } from "@/components/icons"
import { BookingModal } from "@/components/booking-modal"

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

const visaCategories = {
  usa: {
    name: "United States",
    flag: "🇺🇸",
    visas: [
      {
        title: "F-1 Student Visa",
        description: "For full-time students at accredited US colleges, universities, or academic institutions",
        requirements: [
          "I-20 from SEVP-certified school",
          "Proof of financial support",
          "Valid passport",
          "DS-160 form",
        ],
      },
      {
        title: "J-1 Exchange Visitor Visa",
        description:
          "For exchange visitors participating in approved programs including students, scholars, and trainees",
        requirements: ["DS-2019 form", "Program sponsor approval", "English proficiency", "Financial documentation"],
      },
      {
        title: "B-1/B-2 Visitor Visa",
        description: "For temporary visitors for business (B-1) or tourism/medical treatment (B-2)",
        requirements: ["Strong ties to home country", "Financial proof", "Travel itinerary", "Purpose of visit"],
      },
      {
        title: "H-1B Work Visa",
        description: "For specialty occupation workers in fields requiring specialized knowledge",
        requirements: [
          "Job offer from US employer",
          "Bachelor's degree or equivalent",
          "Employer petition",
          "Labor condition application",
        ],
      },
      {
        title: "EB-1 Visa (Priority Workers)",
        description:
          "For persons of extraordinary ability, outstanding professors/researchers, and multinational executives",
        requirements: [
          "Extraordinary ability evidence",
          "Academic achievements",
          "Employment offer",
          "Sustained acclaim",
        ],
      },
      {
        title: "EB-2/EB-3 Visa (Skilled Workers)",
        description: "For professionals with advanced degrees or exceptional ability and skilled workers",
        requirements: ["Labor certification", "Job offer", "Credentials evaluation", "Employer sponsorship"],
      },
    ],
  },
  uk: {
    name: "United Kingdom",
    flag: "🇬🇧",
    visas: [
      {
        title: "Student Visa (Tier 4)",
        description: "For students aged 16+ studying at registered UK educational institutions",
        requirements: [
          "CAS from licensed sponsor",
          "English proficiency (IELTS/TOEFL)",
          "Financial proof",
          "Tuberculosis test",
        ],
      },
      {
        title: "Graduate Visa",
        description: "For international students who have completed a degree in the UK to stay and work",
        requirements: [
          "Valid Student visa",
          "UK degree completion",
          "Applied within visa validity",
          "No switching allowed",
        ],
      },
      {
        title: "Skilled Worker Visa",
        description: "For workers with a job offer from an approved UK employer",
        requirements: [
          "Certificate of sponsorship",
          "Minimum salary threshold",
          "English language proof",
          "Maintenance funds",
        ],
      },
      {
        title: "Standard Visitor Visa",
        description: "For tourism, visiting family, or short business trips up to 6 months",
        requirements: ["Travel purpose evidence", "Accommodation details", "Financial proof", "Return ticket"],
      },
      {
        title: "Global Talent Visa",
        description: "For leaders or potential leaders in academia, research, arts, culture, or digital technology",
        requirements: [
          "Endorsement from approved body",
          "Evidence of achievements",
          "No job offer required",
          "Portfolio of work",
        ],
      },
      {
        title: "Family Visa",
        description: "For joining family members who are British citizens or settled in the UK",
        requirements: ["Relationship proof", "Financial requirement", "English language", "Accommodation evidence"],
      },
    ],
  },
  canada: {
    name: "Canada",
    flag: "🇨🇦",
    visas: [
      {
        title: "Study Permit",
        description: "For international students at designated learning institutions (DLI)",
        requirements: ["Acceptance letter from DLI", "Proof of funds", "Clean criminal record", "Medical exam"],
      },
      {
        title: "Post-Graduation Work Permit (PGWP)",
        description: "For graduates of Canadian institutions to gain work experience",
        requirements: [
          "Completed Canadian program",
          "Valid study permit",
          "Applied within 180 days",
          "Program length eligibility",
        ],
      },
      {
        title: "Express Entry (Federal Skilled Worker)",
        description: "For skilled workers with foreign work experience seeking permanent residence",
        requirements: [
          "CRS score calculation",
          "Language test results",
          "Education credential assessment",
          "Proof of funds",
        ],
      },
      {
        title: "Provincial Nominee Program (PNP)",
        description: "For workers nominated by a Canadian province or territory",
        requirements: [
          "Provincial nomination",
          "Settlement funds",
          "Intent to live in province",
          "Meet stream requirements",
        ],
      },
      {
        title: "Visitor Visa (TRV)",
        description: "For temporary visitors for tourism, family visits, or business",
        requirements: ["Valid passport", "Ties to home country", "Financial support proof", "Travel history"],
      },
      {
        title: "Work Permit (LMIA-based)",
        description: "For workers with a job offer supported by Labour Market Impact Assessment",
        requirements: ["Positive LMIA", "Job offer letter", "Work experience proof", "Qualifications evidence"],
      },
    ],
  },
  australia: {
    name: "Australia",
    flag: "🇦🇺",
    visas: [
      {
        title: "Student Visa (Subclass 500)",
        description: "For international students enrolled in registered courses in Australia",
        requirements: [
          "CoE from registered provider",
          "OSHC health insurance",
          "Financial capacity",
          "English proficiency",
        ],
      },
      {
        title: "Temporary Graduate Visa (Subclass 485)",
        description: "For recent graduates to live, study, and work in Australia temporarily",
        requirements: ["Recent Australian qualification", "Age under 50", "English proficiency", "Health insurance"],
      },
      {
        title: "Skilled Independent Visa (Subclass 189)",
        description: "For skilled workers not sponsored by an employer, state, or family member",
        requirements: ["Points test (65+)", "Skills assessment", "Occupation on skilled list", "English proficiency"],
      },
      {
        title: "Skilled Nominated Visa (Subclass 190)",
        description: "For skilled workers nominated by an Australian state or territory",
        requirements: ["State nomination", "Points test (65+)", "Skills assessment", "Occupation eligibility"],
      },
      {
        title: "Visitor Visa (Subclass 600)",
        description: "For tourists, family visitors, or business visitors",
        requirements: ["Genuine visitor intention", "Financial means", "Health requirements", "Character requirements"],
      },
      {
        title: "Working Holiday Visa (Subclass 417)",
        description: "For young adults from eligible countries to holiday and work in Australia",
        requirements: ["Age 18-30/35", "Eligible passport", "Sufficient funds", "No dependent children"],
      },
    ],
  },
  newzealand: {
    name: "New Zealand",
    flag: "🇳🇿",
    visas: [
      {
        title: "Student Visa",
        description: "For international students studying full-time in New Zealand",
        requirements: ["Offer of place", "Evidence of funds", "Health and character", "Return travel"],
      },
      {
        title: "Post-Study Work Visa",
        description: "For graduates of New Zealand qualifications to gain work experience",
        requirements: [
          "NZ qualification",
          "Applied within 3 months",
          "Acceptable qualification level",
          "Study duration met",
        ],
      },
      {
        title: "Skilled Migrant Category Visa",
        description: "For skilled workers seeking permanent residence based on points",
        requirements: [
          "Points threshold (160+)",
          "Job offer or employment",
          "Skills assessment",
          "Health and character",
        ],
      },
      {
        title: "Essential Skills Work Visa",
        description: "For workers with a job offer in an area where there is a skill shortage",
        requirements: ["Job offer", "Employer accreditation", "Relevant qualifications", "Labour market test"],
      },
      {
        title: "Visitor Visa",
        description: "For tourists and short-term visitors to New Zealand",
        requirements: ["Sufficient funds", "Genuine intention", "Return ticket", "Health requirements"],
      },
      {
        title: "Working Holiday Visa",
        description: "For young people from eligible countries to travel and work",
        requirements: ["Age 18-30/35", "Eligible nationality", "Minimum funds", "No children"],
      },
    ],
  },
}

export default function VisaProcessingPage() {
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("usa")

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
                <PlaneIcon className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">Visa Processing Services</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Comprehensive visa assistance for students, workers, and visitors. Expert guidance from application to
                approval for destinations worldwide.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowBookingModal(true)}>
                  Book Free Consultation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                  onClick={() => (window.location.href = "/contact")}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold text-center mb-4">Our Visa Services</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              End-to-end support throughout your visa application journey
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
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
            <h2 className="font-serif text-3xl font-bold text-center mb-4">Visa Categories by Destination</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Select your destination country to explore available visa options
            </p>

            <Tabs value={selectedCountry} onValueChange={setSelectedCountry} className="max-w-6xl mx-auto">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-8 h-auto p-1">
                {Object.entries(visaCategories).map(([key, country]) => (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-2 py-3">
                    <span className="text-xl">{country.flag}</span>
                    <span className="hidden sm:inline">{country.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(visaCategories).map(([key, country]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  <div className="text-center mb-8">
                    <h3 className="font-serif text-2xl font-bold flex items-center justify-center gap-3">
                      <span className="text-3xl">{country.flag}</span>
                      {country.name} Visa Options
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {country.visas.map((visa, index) => (
                      <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{visa.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4">{visa.description}</p>
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                              Key Requirements:
                            </p>
                            <ul className="space-y-1">
                              {visa.requirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckIcon className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl font-bold text-center mb-12">Our Process</h2>
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  {
                    step: "01",
                    title: "Free Consultation",
                    desc: "Book a call to discuss your visa needs and eligibility",
                  },
                  { step: "02", title: "Document Review", desc: "We assess your documents and create a checklist" },
                  {
                    step: "03",
                    title: "Application Prep",
                    desc: "Complete assistance with forms and supporting documents",
                  },
                  {
                    step: "04",
                    title: "Interview Coaching",
                    desc: "Mock interviews and preparation for your visa interview",
                  },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">{item.step}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Ready to Start Your Visa Application?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Our visa experts have helped thousands of applicants successfully obtain their visas. Book a free
              consultation to discuss your options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => setShowBookingModal(true)}>
                Book Free Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                onClick={() => (window.location.href = "/contact")}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BookingModal open={showBookingModal} onOpenChange={setShowBookingModal} />
    </>
  )
}
