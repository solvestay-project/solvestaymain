import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | Solvestay",
  description: "Terms and conditions for using Solvestay.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-sm sm:prose-base">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground not-prose text-sm">
            Last updated: April 2026. By accessing or using Solvestay
            (&quot;Service&quot;), you agree to these terms. If you do not agree,
            do not use the Service.
          </p>

          <h2>1. The Service</h2>
          <p>
            Solvestay provides an online platform to discover property listings
            and connect seekers with owners. We are not a party to lease or sale
            agreements between users unless expressly stated otherwise.
          </p>

          <h2>2. Accounts</h2>
          <p>
            You must provide accurate information and keep credentials secure. You
            are responsible for activity under your account. We may suspend or
            terminate accounts that violate these terms or harm other users.
          </p>

          <h2>3. Listings and content</h2>
          <p>
            Owners are responsible for the accuracy of listings, compliance with
            law, and having the right to offer the property. Users must not post
            unlawful, misleading, defamatory, or infringing content. We may
            remove or restrict content at our discretion.
          </p>

          <h2>4. Passes and payments</h2>
          <p>
            Paid passes (e.g. Lite, Relax, Freedom) are described on the Pricing
            page. Fees, taxes, and third-party payment terms may apply. Unless
            required by law or stated in a separate refund policy, payments are
            generally non-refundable after benefits are used.
          </p>

          <h2>5. Conduct</h2>
          <ul>
            <li>No harassment, spam, or abuse of other users.</li>
            <li>No circumvention of technical limits or security measures.</li>
            <li>No scraping or automated access that overloads or harms the Service.</li>
          </ul>

          <h2>6. Disclaimers</h2>
          <p>
            The Service is provided &quot;as is&quot; to the fullest extent
            permitted by law. We do not guarantee uninterrupted availability or
            that listings are free of errors. Users should independently verify
            property details and legal suitability before transacting.
          </p>

          <h2>7. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Solvestay and its affiliates
            will not be liable for indirect, incidental, special, consequential,
            or punitive damages, or any loss of profits or data, arising from your
            use of the Service.
          </p>

          <h2>8. Indemnity</h2>
          <p>
            You agree to indemnify and hold harmless Solvestay from claims arising
            out of your content, your use of the Service, or your violation of
            these terms, subject to applicable law.
          </p>

          <h2>9. Changes</h2>
          <p>
            We may modify these terms. Continued use after changes constitutes
            acceptance of the updated terms where permitted by law.
          </p>

          <h2>10. Governing law</h2>
          <p>
            These terms are governed by the laws of India, without regard to
            conflict-of-law rules. Courts at a location we designate may have
            exclusive jurisdiction, subject to mandatory consumer protections.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href="mailto:support@solvestay.com">support@solvestay.com</a>.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
