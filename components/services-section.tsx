import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCapIcon, PlaneIcon, FileCheckIcon, AwardIcon, GlobeIcon, UsersIcon } from "@/components/icons"

const services = [
  {
    icon: GraduationCapIcon,
    title: "University Admissions",
    description: "Complete guidance for Bachelor's, Master's, and PhD admissions to top universities worldwide.",
    features: ["Application Review", "SOP Guidance", "Interview Prep"],
  },
  {
    icon: PlaneIcon,
    title: "Visa Processing",
    description: "End-to-end visa application support with real-time updates and interview preparation.",
    features: ["Document Checklist", "Application Support", "Interview Coaching"],
  },
  {
    icon: FileCheckIcon,
    title: "SEVIS Fee & Registration",
    description: "Seamless SEVIS I-901 fee payment assistance for US-bound students.",
    features: ["Fee Payment", "Form Completion", "Confirmation Tracking"],
  },
  {
    icon: AwardIcon,
    title: "Credential Evaluation",
    description: "WES, ECE, and other credential evaluation services for academic qualifications.",
    features: ["WES Evaluation", "ECE Reports", "Express Processing"],
  },
  {
    icon: GlobeIcon,
    title: "Immigration Consulting",
    description: "Standardized immigration process with qualification assessment before proceeding.",
    features: ["Eligibility Check", "Document Review", "Process Guidance"],
  },
  {
    icon: UsersIcon,
    title: "Ongoing Support",
    description: "Dedicated support throughout your journey with real-time status updates.",
    features: ["24/7 Support", "Progress Tracking", "Expert Advisors"],
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">Our Services</p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
            Comprehensive Support for Your Global Journey
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            From university admissions to visa processing, we provide end-to-end support to help you achieve your
            international education and immigration goals.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group bg-card border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">
                  <service.icon className="h-7 w-7" />
                </div>
                <CardTitle className="mt-4 text-xl text-card-foreground">{service.title}</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
