import Link from "next/link"
import Image from "next/image"
import { InstagramIcon, FacebookIcon } from "@/components/icons"

// X (Twitter) icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.333-3.022.812-.672 1.927-1.09 3.057-1.149l.151-.005c1.298-.008 2.591.244 3.588.896.125-.842.167-1.79.093-2.844l2.086-.162c.108 1.427.058 2.707-.149 3.838 1.094.653 1.97 1.59 2.502 2.755.715 1.563.933 4.485-1.283 6.654-1.89 1.848-4.258 2.654-7.46 2.675zm-.766-5.861c-.065 0-.13.002-.196.006-.932.05-1.65.327-2.134.823-.39.4-.59.892-.562 1.387.043.782.474 1.86 2.071 2.596.613.283 1.292.391 1.934.391.13 0 .258-.004.385-.014 1.13-.061 1.98-.483 2.535-1.175.59-.734.898-1.79.898-3.13a6.22 6.22 0 0 0-.034-.646c-.913-.344-1.951-.495-2.959-.495-.647 0-1.296.086-1.938.257z" />
    </svg>
  )
}

const socialLinks = [
  { icon: InstagramIcon, href: "https://instagram.com/samopconsulting", label: "Instagram" },
  { icon: XIcon, href: "https://x.com/samopconsulting", label: "X" },
  { icon: TikTokIcon, href: "https://tiktok.com/@samopconsulting", label: "TikTok" },
  { icon: FacebookIcon, href: "https://facebook.com/samopconsulting", label: "Facebook" },
  { icon: ThreadsIcon, href: "https://threads.net/@samopconsulting", label: "Threads" },
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
              Your trusted partner for international education and immigration consulting. Legally registered in the
              USA, helping students achieve their dreams since 2014.
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
              © {new Date().getFullYear()} SAMOP Consulting. All rights reserved. Registered in USA.
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
