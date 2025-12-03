import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the services of SAMOP Consulting ("Company," "we," "our"), you agree to be bound
                by these Terms and Conditions. If you disagree with any part of these terms, you may not access our
                services.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                These terms apply to all visitors, users, clients, and others who access or use our educational and
                immigration consulting services, website, and client portal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Services Description</h2>
              <p className="text-muted-foreground leading-relaxed">SAMOP Consulting provides the following services:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>
                  <strong>University Admissions Consulting:</strong> Guidance on university selection, application
                  preparation, document review, and submission support
                </li>
                <li>
                  <strong>Immigration and Visa Services:</strong> Visa application assistance, documentation support,
                  and interview preparation
                </li>
                <li>
                  <strong>SEVIS Registration:</strong> I-901 fee payment assistance and DS-160 guidance
                </li>
                <li>
                  <strong>Credential Evaluation:</strong> Assistance with WES, ECE, and other credential evaluation
                  services
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Important:</strong> We provide consulting and guidance services only. We do not guarantee
                admission to any educational institution or approval of any visa application. Final decisions rest with
                the respective institutions and government agencies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Client Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed">As a client, you agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Provide accurate, complete, and truthful information</li>
                <li>Submit all required documents in a timely manner</li>
                <li>Respond promptly to requests for additional information</li>
                <li>Attend scheduled appointments or provide 24-hour notice for cancellation</li>
                <li>Pay all fees as agreed upon in your service agreement</li>
                <li>Comply with all application deadlines</li>
                <li>Not engage in any fraudulent activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Payment Terms</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">4.1 Service Fees</h3>
              <p className="text-muted-foreground leading-relaxed">
                Service fees are quoted in US Dollars (USD) and are due as specified in your service agreement. We
                accept payments via credit/debit card, bank transfer, and approved payment platforms.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">4.2 Appointment Fees</h3>
              <p className="text-muted-foreground leading-relaxed">
                Consultation appointments require advance payment. Appointment fees are non-refundable except as
                specified in our refund policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Refund Policy</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">5.1 Appointment Cancellations</h3>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-green-600 shrink-0">More than 48 hours:</span>
                    <span>Full refund (100%) of appointment fee</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-yellow-600 shrink-0">24-48 hours:</span>
                    <span>Partial refund (50%) of appointment fee</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-red-600 shrink-0">Less than 24 hours:</span>
                    <span>No refund. Appointment fee is forfeited.</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">5.2 Service Package Refunds</h3>
              <p className="text-muted-foreground leading-relaxed">For comprehensive service packages:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Before work begins: 90% refund (10% administrative fee)</li>
                <li>After initial consultation: 70% refund</li>
                <li>After document preparation begins: 50% refund</li>
                <li>After application submission: No refund</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">5.3 No Refunds For</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Application rejections or visa denials (we do not guarantee outcomes)</li>
                <li>Changes in client circumstances after services are rendered</li>
                <li>Failure to provide required documents or information</li>
                <li>Client's decision to withdraw application</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">5.4 Refund Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Approved refunds are processed within 7-10 business days to the original payment method. Bank processing
                times may vary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are provided "as is" without warranties of any kind. We do not warrant that:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>You will be admitted to any educational institution</li>
                <li>Your visa or immigration application will be approved</li>
                <li>Our services will meet all your specific requirements</li>
                <li>Our website will be uninterrupted or error-free</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, SAMOP Consulting shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Application rejections or visa denials</li>
                <li>Delays caused by third parties (universities, embassies, etc.)</li>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of opportunity or expected benefits</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Our total liability shall not exceed the fees paid by you for the specific service in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on our website, including text, graphics, logos, and software, is the property of SAMOP
                Consulting and is protected by intellectual property laws. You may not reproduce, distribute, or create
                derivative works without our written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account with us, you must provide accurate information and keep your login
                credentials confidential. You are responsible for all activities under your account. Notify us
                immediately of any unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Document Handling</h2>
              <p className="text-muted-foreground leading-relaxed">
                We handle your documents with care and confidentiality. However:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>We are not responsible for documents lost in transit</li>
                <li>Original documents should only be submitted when specifically requested</li>
                <li>We recommend keeping copies of all submitted documents</li>
                <li>Document verification is the client's responsibility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend your account and access to our services if:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>You breach these Terms and Conditions</li>
                <li>You provide false or misleading information</li>
                <li>You engage in fraudulent activities</li>
                <li>Payment obligations are not met</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these terms or our services shall be:
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 mt-3">
                <li>First addressed through good-faith negotiation</li>
                <li>If unresolved, submitted to mediation</li>
                <li>
                  Finally resolved through binding arbitration in accordance with the rules of the American Arbitration
                  Association
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States and the
                State of [Your State], without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective upon posting to our
                website. Your continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">15. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">For questions about these Terms and Conditions:</p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium text-foreground">SAMOP Consulting</p>
                <p className="text-muted-foreground">Email: legal@samopconsulting.com</p>
                <p className="text-muted-foreground">Phone: +1 (555) 123-4567</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t flex gap-6">
            <Link href="/" className="text-primary hover:underline">
              ← Back to Home
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
