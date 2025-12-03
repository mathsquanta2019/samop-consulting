import Link from "next/link"
import Image from "next/image"
import { Instagram, Twitter, Facebook } from "lucide-react"

// TikTok icon component since it's not in lucide
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/samopconsulting", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/samopconsulting", label: "X (Twitter)" },
  { icon: TikTokIcon, href: "https://tiktok.com/@samopconsulting", label: "TikTok" },
  { icon: Facebook, href: "https://facebook.com/samopconsulting", label: "Facebook" },
]

const footerLinks = {
  services: [
    { label: "University Admissions", href: "#services" },
    { label: "Visa Processing", href: "#services" },
    { label: "SEVIS Registration", href: "#services" },
    { label: "Credential Evaluation", href: "#services" },
  ],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
    { label: "Book Consultation", href: "#book" },
    { label: "Client Portal", href: "/client/login" },
  ],
  destinations: [
    { label: "Study in USA", href: "#" },
    { label: "Study in UK", href: "#" },
    { label: "Study in Canada", href: "#" },
    { label: "Study in Australia", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="SAMOP Consulting"
                width={60}
                height={60}
                className="rounded bg-white/10"
              />
              <div>
                <span className="font-serif text-xl font-semibold">Samop Consulting</span>
                <p className="text-xs text-primary-foreground/70">Educational & Visa Services</p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed max-w-sm">
              Your trusted partner for international education and immigration consulting. Helping students achieve
              their dreams since 2014.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Destinations</h4>
            <ul className="space-y-3">
              {footerLinks.destinations.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} SAMOP Consulting. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-primary-foreground/60 hover:text-secondary">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-primary-foreground/60 hover:text-secondary">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
