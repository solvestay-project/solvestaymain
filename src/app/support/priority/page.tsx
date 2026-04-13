"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { subscriptionIncludesPrioritySupport } from "@/lib/types";
import {
  Headphones,
  Phone,
  Search,
  ShieldAlert,
  CreditCard,
  MessageCircle,
} from "lucide-react";

const SUPPORT_PHONE =
  process.env.NEXT_PUBLIC_PRIORITY_SUPPORT_PHONE?.trim() || "";

export default function PrioritySupportPage() {
  const { user, subscription, hasActiveSubscription } = useAuthStore();
  const eligible =
    user?.role === "customer" &&
    hasActiveSubscription() &&
    subscriptionIncludesPrioritySupport(subscription);

  const telHref = SUPPORT_PHONE
    ? `tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`
    : undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Headphones className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Priority support
              </h1>
              <p className="text-muted-foreground mt-1">
                Help while you search — for Relax & Freedom subscribers
              </p>
            </div>
          </div>

          {!user && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Sign in required</CardTitle>
                <CardDescription>
                  Priority support is included with Relax and Freedom plans.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/auth/login?redirect=/support/priority">Sign in</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/pricing">View plans</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {user && user.role === "customer" && !eligible && (
            <Card className="mb-8 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
              <CardHeader>
                <CardTitle>Upgrade for priority support</CardTitle>
                <CardDescription>
                  Your current plan does not include this channel. Relax
                  (Weekly) and Freedom (Monthly) include dedicated priority
                  support while you search.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/pricing">Compare plans</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {user && user.role !== "customer" && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Customer plans only</CardTitle>
                <CardDescription>
                  Priority support is for property seekers on Relax or Freedom
                  plans.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                While you&apos;re searching
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  <span className="text-foreground font-medium">
                    Few or no results?
                  </span>{" "}
                  Widen area or budget slightly, clear extra filters, and try
                  alternate localities nearby.
                </li>
                <li>
                  <span className="text-foreground font-medium">
                    Map or list looks wrong?
                  </span>{" "}
                  Refresh the page, check your network, and confirm you&apos;re
                  signed in.
                </li>
                <li>
                  <span className="text-foreground font-medium">
                    Saved searches &amp; alerts?
                  </span>{" "}
                  Use favorites and filters consistently; availability changes
                  when owners update listings.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Owners &amp; contact details
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  Reveal contact only for listings you intend to pursue; limits
                  apply by plan.
                </li>
                <li>
                  If a number doesn&apos;t connect, try WhatsApp or email from
                  the same reveal — owners may prefer a channel.
                </li>
                <li>
                  Message threads are between you and the owner; keep
                  communication on-platform when possible.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                Safety &amp; trust
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  Never pay brokerage to use Solvestay; deals are directly with
                  owners.
                </li>
                <li>
                  Report suspicious listings or requests from the property page
                  or support line.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Billing &amp; plan
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  Renew or upgrade from{" "}
                  <Link href="/pricing" className="text-primary underline">
                    Pricing
                  </Link>
                  .
                </li>
                <li>
                  After payment, your plan activates immediately. Relax and
                  Freedom subscribers can use direct phone support at the bottom
                  of this page.
                </li>
              </ul>
            </section>
          </div>

          {eligible && (
            <Card className="mt-12 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Direct support
                </CardTitle>
                <CardDescription>
                  Call us for urgent issues while searching — your Relax or
                  Freedom plan includes priority handling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {SUPPORT_PHONE ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <a
                      href={telHref}
                      className="text-2xl sm:text-3xl font-bold text-primary hover:underline break-all"
                    >
                      {SUPPORT_PHONE}
                    </a>
                    <Button asChild size="lg" variant="default">
                      <a href={telHref}>Call now</a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Set{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      NEXT_PUBLIC_PRIORITY_SUPPORT_PHONE
                    </code>{" "}
                    in your environment to show the support number here.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
