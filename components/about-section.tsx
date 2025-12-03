import { CheckCircle2 } from "lucide-react"

const highlights = [
  "100% Success Rate in Immigration Consulting",
  "Pre-qualification Assessment Before Processing",
  "Real-time Application Status Updates",
  "Dedicated Case Managers",
  "Comprehensive Document Review",
  "Interview Preparation & Coaching",
]

export function AboutSection() {
  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="/professional-consulting-office-meeting.jpg"
                alt="SAMOP Consulting team"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 rounded-xl bg-secondary p-6 shadow-lg hidden md:block">
              <p className="text-4xl font-bold text-secondary-foreground">10+</p>
              <p className="text-sm text-secondary-foreground/80">Years Experience</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">About Us</p>
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
              Your Trusted Partner in International Education
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              At SAMOP Consulting, we understand that studying abroad is a life-changing decision. Our team of
              experienced consultants has helped hundreds of students achieve their dreams of studying at prestigious
              universities across Europe, USA, Canada, Australia, and New Zealand.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              What sets us apart is our standardized approach to immigration consulting. We assess your eligibility
              before processing, ensuring a 100% success rate. We believe in transparency, and that's why we only take
              on cases where we're confident of success.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
