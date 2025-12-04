import Link from "next/link"

export default function PrivacyPolicyPage() {
  const effectiveDate = "December 3, 2025"

  return (
    <div className="min-h-screen bg-white">
      {/* Legal Document Header */}
      <header className="border-b-2 border-foreground py-8">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">Privacy Policy</h1>
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
            This Privacy Policy describes how SAMOP Consulting collects, uses, discloses, and protects your personal
            information. By using our services, you consent to the practices described in this policy.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-12 p-6 bg-muted/30 border rounded">
          <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>
              <a href="#introduction" className="hover:text-primary hover:underline">
                Introduction and Scope
              </a>
            </li>
            <li>
              <a href="#information-collected" className="hover:text-primary hover:underline">
                Information We Collect
              </a>
            </li>
            <li>
              <a href="#use-of-information" className="hover:text-primary hover:underline">
                How We Use Your Information
              </a>
            </li>
            <li>
              <a href="#communications" className="hover:text-primary hover:underline">
                Communications (SMS and Email)
              </a>
            </li>
            <li>
              <a href="#cookies" className="hover:text-primary hover:underline">
                Cookies and Tracking Technologies
              </a>
            </li>
            <li>
              <a href="#sharing" className="hover:text-primary hover:underline">
                Information Sharing and Disclosure
              </a>
            </li>
            <li>
              <a href="#security" className="hover:text-primary hover:underline">
                Data Security
              </a>
            </li>
            <li>
              <a href="#retention" className="hover:text-primary hover:underline">
                Data Retention
              </a>
            </li>
            <li>
              <a href="#rights" className="hover:text-primary hover:underline">
                Your Rights
              </a>
            </li>
            <li>
              <a href="#children" className="hover:text-primary hover:underline">
                Children's Privacy
              </a>
            </li>
            <li>
              <a href="#international" className="hover:text-primary hover:underline">
                International Data Transfers
              </a>
            </li>
            <li>
              <a href="#changes" className="hover:text-primary hover:underline">
                Changes to This Policy
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
          <section id="introduction">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 1: INTRODUCTION AND SCOPE</h2>
            <div className="space-y-3">
              <p>
                <strong>1.1</strong> SAMOP Consulting ("Company," "we," "our," or "us") is committed to protecting your
                privacy and personal information. This Privacy Policy explains our practices regarding the collection,
                use, and disclosure of information when you use our educational and immigration consulting services,
                website, and client portal.
              </p>
              <p>
                <strong>1.2</strong> We are a consulting firm registered and operating in the United States. We comply
                with applicable data protection laws including the California Consumer Privacy Act (CCPA), and where
                applicable, the General Data Protection Regulation (GDPR) for clients in the European Union.
              </p>
              <p>
                <strong>1.3</strong> This policy applies to all services provided by SAMOP Consulting, including
                in-person consultations, online services, and our client portal.
              </p>
            </div>
          </section>

          <section id="information-collected">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 2: INFORMATION WE COLLECT</h2>
            <div className="space-y-4">
              <p>
                <strong>2.1 PERSONAL INFORMATION YOU PROVIDE</strong>
              </p>
              <p>
                We collect personal information that you voluntarily provide when using our services, including but not
                limited to:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>
                  <strong>Identity Information:</strong> Full legal name, date of birth, gender, nationality, and
                  citizenship;
                </li>
                <li>
                  <strong>Contact Information:</strong> Email address, phone number, mailing address, and emergency
                  contacts;
                </li>
                <li>
                  <strong>Educational Information:</strong> Academic history, transcripts, degrees, certifications, and
                  test scores;
                </li>
                <li>
                  <strong>Professional Information:</strong> Employment history, professional qualifications, and work
                  experience;
                </li>
                <li>
                  <strong>Identity Documents:</strong> Passport copies, national ID cards, birth certificates, and
                  photographs;
                </li>
                <li>
                  <strong>Immigration Information:</strong> Visa history, travel records, and immigration status;
                </li>
                <li>
                  <strong>Financial Information:</strong> Payment card details, bank account information (for processing
                  payments), and financial statements (when required for visa applications).
                </li>
              </ul>

              <p>
                <strong>2.2 AUTOMATICALLY COLLECTED INFORMATION</strong>
              </p>
              <p>When you visit our website or use our portal, we automatically collect:</p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>IP address and geographic location;</li>
                <li>Device type, operating system, and browser information;</li>
                <li>Pages visited, time spent, and navigation patterns;</li>
                <li>Referring URLs and search terms;</li>
                <li>Cookie identifiers and similar tracking data.</li>
              </ul>
            </div>
          </section>

          <section id="use-of-information">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 3: HOW WE USE YOUR INFORMATION</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1</strong> We use your personal information for the following purposes:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>
                  <strong>Service Delivery:</strong> To provide and manage our consulting services, process
                  applications, and communicate with institutions on your behalf;
                </li>
                <li>
                  <strong>Communications:</strong> To send service-related notifications, appointment reminders, and
                  application updates;
                </li>
                <li>
                  <strong>Account Management:</strong> To create and manage your client portal account;
                </li>
                <li>
                  <strong>Payment Processing:</strong> To process payments and prevent fraudulent transactions;
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes;
                </li>
                <li>
                  <strong>Service Improvement:</strong> To analyze usage patterns and improve our services;
                </li>
                <li>
                  <strong>Marketing:</strong> With your consent, to send promotional communications about our services.
                </li>
              </ul>
            </div>
          </section>

          <section id="communications">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 4: COMMUNICATIONS (SMS AND EMAIL)</h2>
            <div className="space-y-4">
              <p>
                <strong>4.1 TRANSACTIONAL COMMUNICATIONS</strong>
              </p>
              <p>
                By using our services, you consent to receive essential transactional communications via email and/or
                SMS, including:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Application status updates and notifications;</li>
                <li>Document request and deadline reminders;</li>
                <li>Appointment confirmations and reminders;</li>
                <li>Payment confirmations and receipts;</li>
                <li>Account security notifications;</li>
                <li>Important service announcements.</li>
              </ul>
              <p className="mt-2 italic">
                These transactional communications are necessary for service delivery and cannot be opted out of while
                maintaining an active service relationship.
              </p>

              <p>
                <strong>4.2 MARKETING COMMUNICATIONS</strong>
              </p>
              <p>With your explicit opt-in consent, we may send marketing communications including:</p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Information about new services and features;</li>
                <li>Educational content and industry updates;</li>
                <li>Special offers and promotions;</li>
                <li>Newsletter and blog updates.</li>
              </ul>
              <p className="mt-2">You may opt out of marketing communications at any time by:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Clicking the "unsubscribe" link in any marketing email;</li>
                <li>Updating your preferences in your client portal settings;</li>
                <li>Contacting us at privacy@samopconsulting.com.</li>
              </ul>

              <p>
                <strong>4.3 SMS NOTIFICATIONS</strong>
              </p>
              <p>SMS notifications are provided on an opt-in basis only. By opting in to SMS notifications:</p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>You consent to receive text messages at the phone number provided;</li>
                <li>Standard message and data rates from your carrier may apply;</li>
                <li>Message frequency varies based on your application activity;</li>
                <li>You may opt out at any time by replying STOP to any message or updating your portal settings.</li>
              </ul>
            </div>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 5: COOKIES AND TRACKING TECHNOLOGIES</h2>
            <div className="space-y-4">
              <p>
                <strong>5.1</strong> We use cookies and similar tracking technologies to enhance your experience on our
                website. These technologies help us:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Remember your preferences and settings;</li>
                <li>Authenticate your identity and maintain session security;</li>
                <li>Analyze website traffic and usage patterns;</li>
                <li>Deliver relevant content and advertisements.</li>
              </ul>

              <p>
                <strong>5.2 TYPES OF COOKIES WE USE</strong>
              </p>
              <div className="my-4 border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left font-semibold border-b">Cookie Type</th>
                      <th className="p-3 text-left font-semibold border-b">Purpose</th>
                      <th className="p-3 text-left font-semibold border-b">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Essential</td>
                      <td className="p-3">Required for website functionality, security, and authentication</td>
                      <td className="p-3">Session</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Functional</td>
                      <td className="p-3">Remember preferences and personalization settings</td>
                      <td className="p-3">1 year</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Analytics</td>
                      <td className="p-3">Understand visitor behavior and improve services</td>
                      <td className="p-3">2 years</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Marketing</td>
                      <td className="p-3">Deliver relevant advertisements (with consent)</td>
                      <td className="p-3">90 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                <strong>5.3</strong> You can manage cookie preferences through your browser settings. Please note that
                disabling certain cookies may affect website functionality and your user experience.
              </p>
            </div>
          </section>

          <section id="sharing">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 6: INFORMATION SHARING AND DISCLOSURE</h2>
            <div className="space-y-3">
              <p>
                <strong>6.1</strong> We may share your personal information with the following parties:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>
                  <strong>Educational Institutions:</strong> Universities, colleges, and schools as part of your
                  application process;
                </li>
                <li>
                  <strong>Government Agencies:</strong> Embassies, consulates, USCIS, and other relevant immigration and
                  visa authorities;
                </li>
                <li>
                  <strong>Credential Evaluation Services:</strong> WES, ECE, and similar organizations when requested;
                </li>
                <li>
                  <strong>Service Providers:</strong> Payment processors, cloud storage providers, email service
                  providers, and other vendors who assist in our operations;
                </li>
                <li>
                  <strong>Professional Advisors:</strong> Lawyers, accountants, and auditors when necessary;
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law, court order, or government request, or to
                  protect our legal rights.
                </li>
              </ul>
              <p>
                <strong>6.2</strong> We do NOT sell, rent, or trade your personal information to third parties for their
                marketing purposes.
              </p>
              <p>
                <strong>6.3</strong> All third-party service providers are contractually obligated to protect your
                information and use it only for specified purposes.
              </p>
            </div>
          </section>

          <section id="security">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 7: DATA SECURITY</h2>
            <div className="space-y-3">
              <p>
                <strong>7.1</strong> We implement appropriate technical and organizational measures to protect your
                personal information, including:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>SSL/TLS encryption for all data transmission;</li>
                <li>Encrypted storage for sensitive documents and information;</li>
                <li>Access controls limiting data access to authorized personnel only;</li>
                <li>Regular security assessments and vulnerability testing;</li>
                <li>Employee training on data protection and security practices;</li>
                <li>Incident response procedures for potential data breaches.</li>
              </ul>
              <p>
                <strong>7.2</strong> While we strive to protect your information, no method of transmission over the
                internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section id="retention">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 8: DATA RETENTION</h2>
            <div className="space-y-3">
              <p>
                <strong>8.1</strong> We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Provide our services and maintain our relationship with you;</li>
                <li>Comply with legal, regulatory, and professional obligations;</li>
                <li>Resolve disputes and enforce our agreements;</li>
                <li>Meet audit and record-keeping requirements.</li>
              </ul>
              <p>
                <strong>8.2</strong> Application documents and related records are retained for a minimum of seven (7)
                years after service completion for regulatory compliance and professional standards.
              </p>
              <p>
                <strong>8.3</strong> Upon request for deletion, we will remove your data except where retention is
                required by law or legitimate business purposes.
              </p>
            </div>
          </section>

          <section id="rights">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 9: YOUR RIGHTS</h2>
            <div className="space-y-3">
              <p>
                <strong>9.1</strong> Depending on your location, you may have the following rights regarding your
                personal information:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>
                  <strong>Right of Access:</strong> Request a copy of the personal information we hold about you;
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete information;
                </li>
                <li>
                  <strong>Right to Erasure:</strong> Request deletion of your personal information, subject to legal
                  retention requirements;
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> Request limitation of how we use your information;
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Receive your information in a structured, machine-readable
                  format;
                </li>
                <li>
                  <strong>Right to Object:</strong> Object to processing of your information for certain purposes;
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Withdraw previously given consent at any time.
                </li>
              </ul>
              <p>
                <strong>9.2</strong> To exercise these rights, contact us at privacy@samopconsulting.com. We will
                respond within 30 days.
              </p>
              <p>
                <strong>9.3</strong> We will not discriminate against you for exercising your privacy rights.
              </p>
            </div>
          </section>

          <section id="children">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 10: CHILDREN'S PRIVACY</h2>
            <div className="space-y-3">
              <p>
                <strong>10.1</strong> Our services are not directed to individuals under sixteen (16) years of age.
              </p>
              <p>
                <strong>10.2</strong> For minor applicants (under 18), we require parental or legal guardian consent and
                involvement throughout the application process.
              </p>
              <p>
                <strong>10.3</strong> If we become aware that we have collected personal information from a child
                without appropriate consent, we will take steps to delete that information.
              </p>
            </div>
          </section>

          <section id="international">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 11: INTERNATIONAL DATA TRANSFERS</h2>
            <div className="space-y-3">
              <p>
                <strong>11.1</strong> Your information may be transferred to, stored, and processed in countries other
                than your country of residence, including the United States.
              </p>
              <p>
                <strong>11.2</strong> When we transfer data internationally, we ensure appropriate safeguards are in
                place, including:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Standard contractual clauses approved by relevant authorities;</li>
                <li>Binding corporate rules where applicable;</li>
                <li>Compliance with applicable cross-border data transfer regulations.</li>
              </ul>
            </div>
          </section>

          <section id="changes">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 12: CHANGES TO THIS POLICY</h2>
            <div className="space-y-3">
              <p>
                <strong>12.1</strong> We may update this Privacy Policy from time to time to reflect changes in our
                practices, technologies, legal requirements, or other factors.
              </p>
              <p>
                <strong>12.2</strong> We will notify you of material changes by:
              </p>
              <ul className="list-[lower-alpha] list-inside ml-4 space-y-1">
                <li>Email notification to your registered email address;</li>
                <li>Prominent notice on our website;</li>
                <li>Notification within the client portal.</li>
              </ul>
              <p>
                <strong>12.3</strong> Your continued use of our services after the effective date of any modifications
                constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          <section id="contact">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">ARTICLE 13: CONTACT INFORMATION</h2>
            <div className="space-y-3">
              <p>
                For questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact
                our Privacy Officer:
              </p>
              <div className="mt-4 p-4 border bg-muted/20">
                <p className="font-bold">SAMOP Consulting</p>
                <p>Privacy Officer</p>
                <p>Email: privacy@samopconsulting.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: United States</p>
              </div>
              <p className="mt-4">
                If you are not satisfied with our response, you may have the right to lodge a complaint with your local
                data protection authority.
              </p>
            </div>
          </section>
        </div>

        {/* Document Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-foreground">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="font-semibold">END OF PRIVACY POLICY</p>
            <p>© {new Date().getFullYear()} SAMOP Consulting. All rights reserved.</p>
          </div>
          <div className="mt-8 flex justify-center gap-8 text-sm">
            <Link href="/" className="text-primary hover:underline">
              Return to Home
            </Link>
            <Link href="/terms" className="text-primary hover:underline">
              Terms and Conditions
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
