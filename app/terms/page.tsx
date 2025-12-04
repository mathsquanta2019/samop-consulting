import Link from "next/link"

export default function TermsPage() {
  const effectiveDate = "December 3, 2025"

  return (
    <div className="min-h-screen bg-white">
      {/* Legal Document Header */}
      <header className="border-b-2 border-foreground py-8">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">Terms and Conditions</h1>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">SAMOP Consulting</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 max-w-4xl py-12">
        {/* Document Info */}
        <div className="mb-10 pb-6 border-b text-sm text-muted-foreground">
          <p>
            <strong>Effective Date:</strong> {effectiveDate}
          </p>
          <p>
            <strong>Document Version:</strong> 1.0
          </p>
          <p className="mt-4 italic">
            Please read these Terms and Conditions carefully before using our services. By accessing or using the
            services of SAMOP Consulting, you agree to be bound by these terms.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-12 p-6 bg-muted/30 border rounded">
          <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>
              <a href="#definitions" className="hover:text-primary hover:underline">
                Definitions
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-primary hover:underline">
                Services Description
              </a>
            </li>
            <li>
              <a href="#client-responsibilities" className="hover:text-primary hover:underline">
                Client Responsibilities
              </a>
            </li>
            <li>
              <a href="#payment" className="hover:text-primary hover:underline">
                Payment Terms
              </a>
            </li>
            <li>
              <a href="#refund" className="hover:text-primary hover:underline">
                Refund Policy
              </a>
            </li>
            <li>
              <a href="#disclaimers" className="hover:text-primary hover:underline">
                Disclaimers and Limitations
              </a>
            </li>
            <li>
              <a href="#intellectual-property" className="hover:text-primary hover:underline">
                Intellectual Property
              </a>
            </li>
            <li>
              <a href="#accounts" className="hover:text-primary hover:underline">
                User Accounts
              </a>
            </li>
            <li>
              <a href="#documents" className="hover:text-primary hover:underline">
                Document Handling
              </a>
            </li>
            <li>
              <a href="#termination" className="hover:text-primary hover:underline">
                Termination
              </a>
            </li>
            <li>
              <a href="#dispute" className="hover:text-primary hover:underline">
                Dispute Resolution
              </a>
            </li>
            <li>
              <a href="#governing-law" className="hover:text-primary hover:underline">
                Governing Law
              </a>
            </li>
            <li>
              <a href="#amendments" className="hover:text-primary hover:underline">
                Amendments
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-primary hover:underline">
                Contact Information
              </a>
            </li>
          </ol>
        </nav>

        {/* Legal Content */}
        <div className="space-y-10 text-[15px] leading-7 text-foreground">
          <section id="definitions">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 1: DEFINITIONS</h2>
            <div className="space-y-3">
              <p>
                <strong>1.1</strong> "Company," "we," "our," or "us" refers to SAMOP Consulting, a consulting firm
                registered in the United States.
              </p>
              <p>
                <strong>1.2</strong> "Client," "you," or "your" refers to any individual or entity that accesses or uses
                our services.
              </p>
              <p>
                <strong>1.3</strong> "Services" refers to all educational consulting, immigration assistance, and
                related services provided by the Company.
              </p>
              <p>
                <strong>1.4</strong> "Portal" refers to our online client management system accessible at our website.
              </p>
              <p>
                <strong>1.5</strong> "Appointment" refers to any scheduled consultation, meeting, or session with our
                consultants.
              </p>
            </div>
          </section>

          <section id="services">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 2: SERVICES DESCRIPTION</h2>
            <div className="space-y-3">
              <p>
                <strong>2.1</strong> SAMOP Consulting provides the following professional services:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>
                  <strong>University Admissions Consulting:</strong> Guidance on university selection, application
                  preparation, document review, and submission support for undergraduate, graduate, and doctoral
                  programs.
                </li>
                <li>
                  <strong>Immigration and Visa Services:</strong> Visa application assistance, documentation support,
                  interview preparation, and guidance for various visa categories.
                </li>
                <li>
                  <strong>SEVIS Registration:</strong> I-901 fee payment assistance and DS-160 form guidance for student
                  visa applicants.
                </li>
                <li>
                  <strong>Credential Evaluation:</strong> Assistance with WES, ECE, and other credential evaluation
                  services.
                </li>
              </ul>
              <p className="mt-4">
                <strong>2.2 IMPORTANT DISCLAIMER:</strong> The Company provides consulting and guidance services only.
                We do not guarantee admission to any educational institution, approval of any visa application, or any
                specific outcome. Final decisions rest solely with the respective institutions, government agencies, and
                authorities.
              </p>
            </div>
          </section>

          <section id="client-responsibilities">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 3: CLIENT RESPONSIBILITIES</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1</strong> As a client of SAMOP Consulting, you agree to:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Provide accurate, complete, and truthful information at all times;</li>
                <li>Submit all required documents in a timely manner as requested;</li>
                <li>Respond promptly to requests for additional information or clarification;</li>
                <li>
                  Attend all scheduled appointments or provide adequate notice for cancellation as specified in Article
                  5;
                </li>
                <li>Pay all fees as agreed upon in your service agreement;</li>
                <li>Comply with all application deadlines;</li>
                <li>Not engage in any fraudulent, misleading, or illegal activities.</li>
              </ul>
              <p>
                <strong>3.2</strong> Failure to comply with these responsibilities may result in termination of services
                without refund.
              </p>
            </div>
          </section>

          <section id="payment">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 4: PAYMENT TERMS</h2>
            <div className="space-y-3">
              <p>
                <strong>4.1 Currency:</strong> All service fees are quoted and payable in United States Dollars (USD)
                unless otherwise specified in writing.
              </p>
              <p>
                <strong>4.2 Payment Methods:</strong> We accept payments via credit/debit card, bank transfer, and other
                approved payment platforms as indicated on our website.
              </p>
              <p>
                <strong>4.3 Payment Schedule:</strong> Fees are due as specified in your individual service agreement.
                Consultation appointments require advance payment before the scheduled time.
              </p>
              <p>
                <strong>4.4 Late Payment:</strong> Failure to pay fees when due may result in suspension of services. A
                late payment fee of 1.5% per month may be applied to overdue balances.
              </p>
              <p>
                <strong>4.5 Taxes:</strong> Fees do not include applicable taxes. You are responsible for any taxes,
                duties, or levies imposed by your jurisdiction.
              </p>
            </div>
          </section>

          <section id="refund">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 5: REFUND POLICY</h2>
            <div className="space-y-4">
              <p>
                <strong>5.1 APPOINTMENT CANCELLATION REFUNDS</strong>
              </p>
              <p>
                The following refund schedule applies to appointment cancellations based on the time remaining before
                your scheduled appointment:
              </p>

              <div className="my-6 border-2 border-foreground">
                <table className="w-full text-sm">
                  <thead className="bg-foreground text-background">
                    <tr>
                      <th className="p-3 text-left font-semibold">Cancellation Notice Period</th>
                      <th className="p-3 text-left font-semibold">Refund Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">More than 48 hours before appointment</td>
                      <td className="p-3 font-semibold">100% Full Refund</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Between 24 and 48 hours before appointment</td>
                      <td className="p-3 font-semibold">50% Partial Refund</td>
                    </tr>
                    <tr>
                      <td className="p-3">Less than 24 hours before appointment</td>
                      <td className="p-3 font-semibold">No Refund - Fee Forfeited</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                <strong>5.2 SERVICE PACKAGE REFUNDS</strong>
              </p>
              <p>For comprehensive service packages, refunds are calculated as follows:</p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Before any work begins: 90% refund (10% administrative fee retained)</li>
                <li>After initial consultation completed: 70% refund</li>
                <li>After document preparation begins: 50% refund</li>
                <li>After application submission: No refund</li>
              </ul>

              <p>
                <strong>5.3 NON-REFUNDABLE CIRCUMSTANCES</strong>
              </p>
              <p>No refunds shall be issued for:</p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Application rejections or visa denials (the Company does not guarantee outcomes);</li>
                <li>Changes in client circumstances after services are rendered;</li>
                <li>Client's failure to provide required documents or information;</li>
                <li>Client's decision to withdraw application after services commenced;</li>
                <li>No-show for scheduled appointments without prior cancellation.</li>
              </ul>

              <p>
                <strong>5.4 REFUND PROCESSING</strong>
              </p>
              <p>
                Approved refunds shall be processed within seven (7) to ten (10) business days to the original payment
                method. Additional processing time by banks or payment processors is beyond our control.
              </p>
            </div>
          </section>

          <section id="disclaimers">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">
              ARTICLE 6: DISCLAIMERS AND LIMITATIONS OF LIABILITY
            </h2>
            <div className="space-y-3">
              <p>
                <strong>6.1 NO GUARANTEES:</strong> Our services are provided on an "AS IS" and "AS AVAILABLE" basis. We
                make no warranties, express or implied, regarding:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Admission to any educational institution;</li>
                <li>Approval of any visa or immigration application;</li>
                <li>Specific outcomes or results;</li>
                <li>Uninterrupted or error-free website operation.</li>
              </ul>

              <p>
                <strong>6.2 LIMITATION OF LIABILITY:</strong> To the maximum extent permitted by applicable law, SAMOP
                Consulting shall not be liable for:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Any indirect, incidental, special, consequential, or punitive damages;</li>
                <li>Application rejections or visa denials;</li>
                <li>Delays caused by third parties including universities, embassies, or government agencies;</li>
                <li>Loss of opportunity, revenue, or expected benefits;</li>
                <li>Actions or decisions of educational institutions or government authorities.</li>
              </ul>

              <p>
                <strong>6.3 MAXIMUM LIABILITY:</strong> Our total aggregate liability shall not exceed the total fees
                paid by you for the specific service giving rise to the claim.
              </p>
            </div>
          </section>

          <section id="intellectual-property">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 7: INTELLECTUAL PROPERTY</h2>
            <div className="space-y-3">
              <p>
                <strong>7.1</strong> All content on our website, including but not limited to text, graphics, logos,
                images, software, and documentation, is the exclusive property of SAMOP Consulting or its licensors and
                is protected by intellectual property laws.
              </p>
              <p>
                <strong>7.2</strong> You may not reproduce, distribute, modify, display, or create derivative works from
                any content without our prior written consent.
              </p>
            </div>
          </section>

          <section id="accounts">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 8: USER ACCOUNTS</h2>
            <div className="space-y-3">
              <p>
                <strong>8.1</strong> When creating an account on our Portal, you must provide accurate and complete
                information.
              </p>
              <p>
                <strong>8.2</strong> You are solely responsible for maintaining the confidentiality of your login
                credentials and for all activities that occur under your account.
              </p>
              <p>
                <strong>8.3</strong> You must notify us immediately of any unauthorized access to or use of your
                account.
              </p>
              <p>
                <strong>8.4</strong> We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </div>
          </section>

          <section id="documents">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 9: DOCUMENT HANDLING</h2>
            <div className="space-y-3">
              <p>
                <strong>9.1</strong> We handle all client documents with appropriate care and confidentiality in
                accordance with our Privacy Policy.
              </p>
              <p>
                <strong>9.2</strong> We are not responsible for documents lost in transit to third parties.
              </p>
              <p>
                <strong>9.3</strong> Original documents should only be submitted when specifically requested. We
                recommend maintaining copies of all documents.
              </p>
              <p>
                <strong>9.4</strong> Verification of document authenticity remains the client's responsibility.
              </p>
            </div>
          </section>

          <section id="termination">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 10: TERMINATION</h2>
            <div className="space-y-3">
              <p>
                <strong>10.1</strong> We reserve the right to terminate or suspend your account and access to our
                services immediately, without prior notice, if:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>You breach any provision of these Terms and Conditions;</li>
                <li>You provide false, misleading, or fraudulent information;</li>
                <li>You engage in illegal activities;</li>
                <li>Payment obligations are not met.</li>
              </ul>
              <p>
                <strong>10.2</strong> Upon termination, your right to use our services ceases immediately. Provisions
                that by their nature should survive termination shall remain in effect.
              </p>
            </div>
          </section>

          <section id="dispute">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 11: DISPUTE RESOLUTION</h2>
            <div className="space-y-3">
              <p>
                <strong>11.1</strong> Any dispute arising from or relating to these Terms or our services shall be
                resolved through the following process:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>
                  <strong>Negotiation:</strong> The parties shall first attempt to resolve the dispute through
                  good-faith negotiation within thirty (30) days;
                </li>
                <li>
                  <strong>Mediation:</strong> If negotiation fails, the dispute shall be submitted to mediation
                  administered by a mutually agreed mediator;
                </li>
                <li>
                  <strong>Arbitration:</strong> If mediation fails, the dispute shall be finally resolved by binding
                  arbitration in accordance with the rules of the American Arbitration Association.
                </li>
              </ul>
              <p>
                <strong>11.2</strong> You agree to waive any right to participate in a class action lawsuit or
                class-wide arbitration.
              </p>
            </div>
          </section>

          <section id="governing-law">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 12: GOVERNING LAW</h2>
            <div className="space-y-3">
              <p>
                <strong>12.1</strong> These Terms and Conditions shall be governed by and construed in accordance with
                the laws of the United States and the State of Delaware, without regard to conflict of law principles.
              </p>
              <p>
                <strong>12.2</strong> Any legal proceedings shall be conducted in the state or federal courts located in
                Delaware.
              </p>
            </div>
          </section>

          <section id="amendments">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 13: AMENDMENTS</h2>
            <div className="space-y-3">
              <p>
                <strong>13.1</strong> We reserve the right to modify these Terms and Conditions at any time at our sole
                discretion.
              </p>
              <p>
                <strong>13.2</strong> Material changes will be communicated via email or prominent notice on our website
                at least thirty (30) days before taking effect.
              </p>
              <p>
                <strong>13.3</strong> Your continued use of our services after the effective date of any modifications
                constitutes your acceptance of the revised terms.
              </p>
            </div>
          </section>

          <section id="contact">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 14: CONTACT INFORMATION</h2>
            <div className="space-y-3">
              <p>For questions, concerns, or notices regarding these Terms and Conditions, please contact:</p>
              <div className="mt-4 p-4 border bg-muted/20">
                <p className="font-bold">SAMOP Consulting</p>
                <p>Legal Department</p>
                <p>Email: legal@samopconsulting.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: United States</p>
              </div>
            </div>
          </section>
        </div>

        {/* Document Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-foreground">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="font-semibold">END OF TERMS AND CONDITIONS</p>
            <p>© {new Date().getFullYear()} SAMOP Consulting. All rights reserved.</p>
          </div>
          <div className="mt-8 flex justify-center gap-8 text-sm">
            <Link href="/" className="text-primary hover:underline">
              Return to Home
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
