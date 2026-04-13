import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us | Solvestay",
  description:
    "Learn about Solvestay — India's transparent property platform connecting renters and buyers directly with owners.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-headings:font-semibold">
          <h1>About Solvestay</h1>
          <p className="text-muted-foreground text-lg not-prose leading-relaxed">
            We help you find a home without brokerage — by connecting you
            directly with verified property owners.
          </p>

          <h2>Our mission</h2>
          <p>
            Solvestay exists to make renting and buying simpler and fairer.
            Traditional listings often hide costs behind brokers. We focus on
            clarity: real photos, honest details, and direct conversations with
            owners so you can decide faster with less friction.
          </p>

          <h2>What we do</h2>
          <ul>
            <li>
              <strong>Listings you can trust</strong> — Owners can list
              residential properties, PGs, and more. We encourage verification so
              seekers know who they are dealing with.
            </li>
            <li>
              <strong>Direct contact</strong> — With an active pass, you can
              reveal owner contact details and chat on your terms. No middleman
              cut on introductions.
            </li>
            <li>
              <strong>Simple plans</strong> — Lite, Relax, and Freedom passes
              fit short trials or serious search windows. You pay for access when
              you need it, not endless subscriptions you did not choose.
            </li>
          </ul>

          <h2>Zero brokerage mindset</h2>
          <p>
            We do not charge brokerage for connecting seekers and owners on the
            platform. Our revenue comes from optional passes and value-added
            features — not from inflating rent or sale prices.
          </p>

          <h2>Who we serve</h2>
          <p>
            <strong>Seekers</strong> — Families, students, and professionals
            looking for rent, purchase, or PG options across cities.
            <br />
            <strong>Owners</strong> — Individuals and landlords who want serious
            enquiries without paying a chain of intermediaries.
          </p>

          <div className="not-prose mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/properties">Browse properties</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">View plans</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
