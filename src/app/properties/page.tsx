import type { Metadata } from "next";
import PropertiesPageClient from "./PropertiesPageClient";

export const metadata: Metadata = {
  title: "Flats, Houses & PGs for Rent in India | Solvestay Properties",
  description:
    "Browse verified owner-listed houses, flats, PGs and commercial properties for rent across top cities in India. Filter by city, locality, budget, BHK and amenities with zero brokerage.",
};

export default function PropertiesPage() {
  return <PropertiesPageClient />;
}
