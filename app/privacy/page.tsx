import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                SAMOP Consulting ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our educational and
                immigration consulting services, visit our website, or use our client portal.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We are a legally registered consulting firm in the United States, and we comply with applicable data
                protection laws including the California Consumer Privacy Act (CCPA) and relevant international
                regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">2.1 Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We collect personal information that you voluntarily provide, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Full name, date of birth, and gender</li>
                <li>Contact information (email address, phone number, mailing address)</li>
                <li>Nationality and citizenship information</li>
                <li>Educational history and academic records</li>
                <li>Employment history and professional qualifications</li>
                <li>Passport and identity documents</li>
                <li>Financial information for service payments</li>
                <li>Immigration history and visa information</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you visit our website, we automatically collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website addresses</li>
                <li>Cookie and tracking data (see Section 6)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>To provide and manage our consulting services</li>
                <li>To process university and visa applications on your behalf</li>
                <li>To communicate with you about your application status</li>
                <li>To schedule and manage appointments</li>
                <li>To process payments and prevent fraud</li>
                <li>To send service-related notifications (SMS and email)</li>
                <li>To improve our services and website functionality</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Communications (SMS and Email)</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">4.1 Service Communications</h3>
              <p className="text-muted-foreground leading-relaxed">
                By using our services, you consent to receive transactional communications including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Application status updates</li>
                <li>Document request notifications</li>
                <li>Appointment reminders and confirmations</li>
                <li>Payment confirmations and receipts</li>
                <li>Important deadline reminders</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">4.2 Marketing Communications</h3>
              <p className="text-muted-foreground leading-relaxed">
                With your explicit consent, we may send marketing communications about our services, educational
                opportunities, and industry updates. You can opt out of marketing communications at any time through
                your account settings or by clicking the unsubscribe link in our emails.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">4.3 SMS Notifications</h3>
              <p className="text-muted-foreground leading-relaxed">
                SMS notifications are opt-in only. Standard message and data rates may apply. You can opt out of SMS
                notifications at any time by replying STOP to any message or updating your preferences in your client
                portal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">We may share your information with:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>
                  <strong>Educational Institutions:</strong> Universities and colleges as part of your application
                  process
                </li>
                <li>
                  <strong>Government Agencies:</strong> Visa offices, USCIS, and other relevant authorities
                </li>
                <li>
                  <strong>Service Providers:</strong> Payment processors, email services, and cloud storage providers
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our legal rights
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We do not sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your experience on our website:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>
                  <strong>Essential Cookies:</strong> Required for website functionality and security
                </li>
                <li>
                  <strong>Functional Cookies:</strong> Remember your preferences and settings
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how visitors use our site
                </li>
                <li>
                  <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with consent)
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can manage cookie preferences through your browser settings. Disabling certain cookies may affect
                website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information,
                including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure cloud storage with access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Employee training on data protection</li>
                <li>Limited access on a need-to-know basis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with
                legal obligations. Application documents are retained for a minimum of 7 years after service completion
                for regulatory compliance. You may request deletion of your data subject to legal retention
                requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, contact us at privacy@samopconsulting.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not directed to individuals under 16 years of age. For minor applicants, we require
                parental or guardian consent and involvement throughout the application process.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence.
                We ensure appropriate safeguards are in place for international transfers in compliance with applicable
                laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by email or
                through our website. Your continued use of our services after changes constitutes acceptance of the
                updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about this Privacy Policy or our data practices, contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium text-foreground">SAMOP Consulting</p>
                <p className="text-muted-foreground">Email: privacy@samopconsulting.com</p>
                <p className="text-muted-foreground">Phone: +1 (555) 123-4567</p>
                <p className="text-muted-foreground">Address: United States</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link href="/" className="text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
