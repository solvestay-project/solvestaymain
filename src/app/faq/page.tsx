import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "FAQ | Solvestay",
  description:
    "Frequently asked questions about Solvestay — listings, plans, payments, and contacting owners.",
};

const faqs = [
  {
    q: "Does Solvestay charge brokerage?",
    a: "No. We connect you directly with property owners. You may purchase a short-term pass to unlock owner contact details; that is not brokerage on rent or sale price.",
  },
  {
    q: "How do I contact an owner?",
    a: "Create an account, choose a plan that fits your search, then use “reveal contact” on a listing you like. You will see phone, WhatsApp, or email depending on what the owner provided.",
  },
  {
    q: "What are Lite, Relax, and Freedom plans?",
    a: "Lite (2-Day) is for quick tries. Relax (Weekly) suits active hunters with favorites and priority support. Freedom (Monthly) offers longer access and extras like early listing visibility — see the Pricing page for current limits and features.",
  },
  {
    q: "Can owners list for free?",
    a: "Owners can list properties; verification may be required before listings go live. Optional paid visibility may be offered separately.",
  },
  {
    q: "What payment methods are supported?",
    a: "We use secure checkout (e.g. Razorpay) for passes — UPI, cards, net banking, and common wallets where available.",
  },
  {
    q: "What if my pass expires?",
    a: "Your subscription window ends on the expiry date. You can buy a new pass anytime. Saved favorites typically remain in your account.",
  },
  {
    q: "How do I report a suspicious listing?",
    a: "Use the report option on the property page or reach out through support channels if you are on a plan that includes priority support.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Frequently asked questions
          </h1>
          <p className="text-muted-foreground mb-10">
            Quick answers about searching, plans, and trust on Solvestay.
          </p>
          <div className="space-y-4">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <h2 className="font-semibold text-base mb-2">{item.q}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/pricing">Pricing &amp; plans</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/about">About us</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
