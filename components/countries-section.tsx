const countries = [
  { name: "United States", flag: "🇺🇸", programs: "500+" },
  { name: "United Kingdom", flag: "🇬🇧", programs: "350+" },
  { name: "Canada", flag: "🇨🇦", programs: "400+" },
  { name: "Australia", flag: "🇦🇺", programs: "300+" },
  { name: "Germany", flag: "🇩🇪", programs: "200+" },
  { name: "New Zealand", flag: "🇳🇿", programs: "150+" },
]

export function CountriesSection() {
  return (
    <section className="py-20 lg:py-28 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">Destinations</p>
          <h2 className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
            Study in Your Dream Country
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/70 leading-relaxed">
            We have partnerships with universities across these popular study destinations.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {countries.map((country, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-xl bg-primary-foreground/10 p-6 backdrop-blur transition-all hover:bg-primary-foreground/20"
            >
              <span className="text-5xl mb-3">{country.flag}</span>
              <p className="font-medium text-primary-foreground text-center">{country.name}</p>
              <p className="text-sm text-secondary">{country.programs} Programs</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
