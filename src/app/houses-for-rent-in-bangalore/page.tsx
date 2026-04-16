import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Houses for Rent in Bangalore | Independent House Rent | Solvestay",
  description:
    "Browse verified independent houses for rent in Bangalore with zero brokerage. See popular areas, average rents and direct owner listings on Solvestay.",
};

const POPULAR_AREAS = [
  "Whitefield",
  "Koramangala",
  "Indiranagar",
  "HSR Layout",
  "Marathahalli",
  "Sarjapur Road",
];

export default function HousesForRentInBangalorePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <p className="text-xs font-medium uppercase tracking-wide text-primary mb-2">
              Bangalore · House Rentals
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Houses for Rent in Bangalore
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Find independent houses for rent in Bangalore with zero brokerage.
              Filter by BHK, budget and locality, then contact owners directly
              through Solvestay.
            </p>
          </header>

          <section className="mb-10 rounded-2xl border bg-card/60 p-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-2">
              Start browsing houses in Bangalore
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Jump straight into owner-listed houses for rent in Bangalore with
              pre-applied filters on our main properties page.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/properties?city=Bangalore&property_type=house&listing_type=rent">
                  View houses for rent in Bangalore
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/properties?city=Bangalore&listing_type=rent">
                  View all rentals in Bangalore
                </Link>
              </Button>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">
              Why rent a house in Bangalore with Solvestay?
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Bangalore has strong demand for independent houses among families,
              working professionals and long-term tenants. With Solvestay, you
              avoid traditional brokerage and connect directly with verified
              owners.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Zero brokerage on house rentals — pay only for contact access.</li>
              <li>Verified owner profiles and property details where available.</li>
              <li>
                Filters for BHK, furnishing, budget, and nearby areas like tech
                parks or metro stations.
              </li>
              <li>Option to save favorites and compare houses across areas.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">
              Popular areas for house rent in Bangalore
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              These localities are commonly searched by families and
              professionals looking for independent houses in Bangalore:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POPULAR_AREAS.map((area) => (
                <Link
                  key={area}
                  href={`/properties?city=Bangalore&area=${encodeURIComponent(
                    area,
                  )}&property_type=house&listing_type=rent`}
                  className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm hover:border-primary/60 hover:text-primary transition-colors"
                >
                  <span>{area}</span>
                  <span className="text-xs text-muted-foreground">
                    View houses
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">
              Typical house rent ranges in Bangalore
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Exact rents vary by locality and furnishing, but many independent
              houses in Bangalore roughly fall into these bands:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>1 BHK houses: often from around ₹10,000–₹18,000 per month.</li>
              <li>2 BHK houses: frequently in the ₹18,000–₹30,000 range.</li>
              <li>
                3 BHK and larger houses: ₹30,000+ depending on area, plot size
                and amenities.
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              These ranges are indicative only. Use filters on the properties
              page to see live prices from owners.
            </p>
          </section>

          <section aria-label="FAQ about house rent in Bangalore">
            <h2 className="text-xl font-semibold mb-3">
              FAQ: House rent in Bangalore
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Is it easy to find independent houses for rent in Bangalore?
                </h3>
                <p>
                  Supply varies by locality, but many peripheral and residential
                  areas still have a good number of independent houses. Use
                  Solvestay filters for &quot;house&quot; plus your preferred
                  budget to see active listings from owners.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Which areas are best for renting a house in Bangalore?
                </h3>
                <p>
                  Localities like Whitefield, HSR Layout, Sarjapur Road,
                  Marathahalli, and parts of North Bangalore are popular among
                  families and professionals. Your ideal area will depend on
                  commute, schools and budget.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  How can I avoid brokerage on house rentals?
                </h3>
                <p>
                  On Solvestay you deal directly with property owners. You pay a
                  small fee only to unlock contact details; there is no
                  percentage-based brokerage added to your rent.
                </p>
              </div>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

