import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Solvestay",
  description: "How Solvestay collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-sm sm:prose-base">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground not-prose text-sm">
            Last updated: April 2026. This policy describes how Solvestay
            (&quot;we&quot;, &quot;us&quot;) handles information when you use our
            website and services.
          </p>

          <h2>1. Information we collect</h2>
          <ul>
            <li>
              <strong>Account data</strong> — Name, email, phone, and profile
              details you provide when registering or completing your profile.
            </li>
            <li>
              <strong>Property &amp; listing data</strong> — Descriptions,
              photos, location, pricing, and availability you submit as an owner
              or that we display from your listings.
            </li>
            <li>
              <strong>Usage &amp; technical data</strong> — IP address, device
              type, browser, pages viewed, and cookies or similar technologies
              used to keep you signed in and improve the product.
            </li>
            <li>
              <strong>Payments</strong> — Payment processing is handled by
              third-party providers (e.g. Razorpay). We do not store full card
              numbers on our servers; we may store transaction references and
              subscription status.
            </li>
          </ul>

          <h2>2. How we use information</h2>
          <p>We use data to:</p>
          <ul>
            <li>Operate accounts, listings, search, and messaging features.</li>
            <li>Verify owners and reduce fraud where applicable.</li>
            <li>Process payments and manage subscription passes.</li>
            <li>Send service-related notices and respond to support requests.</li>
            <li>Improve security, analytics, and product experience.</li>
          </ul>

          <h2>3. Sharing</h2>
          <p>
            We may share information with service providers (hosting, database,
            email, payments) who process it on our instructions. We may disclose
            information if required by law or to protect rights and safety. We
            do not sell your personal information to third parties for their
            independent marketing.
          </p>

          <h2>4. Retention</h2>
          <p>
            We retain data as long as your account is active or as needed to
            provide services, comply with law, resolve disputes, and enforce our
            agreements.
          </p>

          <h2>5. Your choices</h2>
          <ul>
            <li>Access or update profile information in your account settings.</li>
            <li>Request deletion of your account where applicable law allows.</li>
            <li>Control cookies through your browser settings (some features may
            require cookies).</li>
          </ul>

          <h2>6. Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect
            data. No method of transmission over the Internet is 100% secure.
          </p>

          <h2>7. Children</h2>
          <p>
            Our services are not directed at children under 13. We do not
            knowingly collect personal information from children.
          </p>

          <h2>8. Changes</h2>
          <p>
            We may update this policy from time to time. We will post the revised
            version on this page and update the &quot;Last updated&quot; date.
          </p>

          <h2>9. Contact</h2>
          <p>
            For privacy questions, contact us at{" "}
            <a href="mailto:support@solvestay.com">support@solvestay.com</a>.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
