import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title:
    "Zero Brokerage Flats, Houses & PGs for Rent in India | Solvestay",
  description:
    "Find verified houses, flats, PGs and commercial properties for rent with zero brokerage. Connect directly with property owners in top Indian cities and get owner contact for just ₹49.",
  openGraph: {
    title:
      "Solvestay – Find Your Perfect Home with Zero Brokerage",
    description:
      "Search verified owner-listed houses, flats, PGs and commercial properties for rent across India. No brokers, no hidden fees – contact owners directly on Solvestay.",
    url: "https://www.solvestay.com/",
    siteName: "Solvestay",
    type: "website",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
