"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store";
import type { Subscription } from "@/lib/types";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Crown,
  Gem,
  IndianRupee,
  MessageSquare,
  Send,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const HERO_BUILDING_LEFT =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
const HERO_BUILDING_RIGHT =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";

const plans = [
  {
    id: "day",
    name: "Lite Plan (2-Day)",
    price: 49,
    period: "2 days",
    description: "Perfect for quick property searches",
    icon: Send,
    features: [
      { text: "5 property contacts", included: true },
      { text: "Basic search filters", included: true },
      { text: "Chat with owners", included: true },
      { text: "48 hours access", included: true },
      { text: "AI Dream Home Search", included: true },
      { text: "Save favorites", included: false },
      { text: "Price insights", included: false },
    ],
    popular: false,
  },
  {
    id: "weekly",
    name: "Relax Plan (Weekly)",
    price: 150,
    period: "week",
    description: "Best for serious property hunters",
    icon: Crown,
    features: [
      { text: "20 property contacts", included: true },
      { text: "Advanced search filters", included: true },
      { text: "Chat with owners", included: true },
      { text: "7 days access", included: true },
      { text: "Save favorites", included: true },
      { text: "Priority support", included: true },
      { text: "AI Dream Home Search", included: true },
    ],
    popular: true,
  },
  {
    id: "monthly",
    name: "Freedom Plan (Monthly)",
    price: 499,
    period: "month",
    description: "Best value for a full month of searching",
    icon: Gem,
    features: [
      { text: "20 property contacts", included: true },
      { text: "Advanced search filters", included: true },
      { text: "Priority support", included: true },
      { text: "Save favorites", included: true },
      { text: "Chat with owners", included: true },
      { text: "30 days access", included: true },
      { text: "AI Dream Home Search", included: true },
    ],
    popular: false,
  },
];

const faqs = [
  {
    question: "What happens after my subscription expires?",
    answer:
      "Your subscription will automatically deactivate. You can renew anytime to continue accessing contact details. Your saved favorites will remain in your account.",
  },
  {
    question: "Can I upgrade my plan mid-subscription?",
    answer:
      "Yes! You can upgrade at any time. The remaining days from your current plan will be adjusted proportionally to your new plan.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "We offer a full refund within 24 hours of purchase if you haven't used any contacts. After that, refunds are processed on a case-by-case basis.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit/debit cards, UPI, net banking, and popular wallets like Paytm, PhonePe, and Google Pay.",
  },
  {
    question: "Are there any hidden charges?",
    answer:
      "Absolutely not! The price you see is the price you pay. No brokerage, no hidden fees, no commissions.",
  },
];

const benefits = [
  {
    icon: MessageSquare,
    title: "Direct Contact",
    description: "Chat and call property owners directly without any middlemen",
  },
  {
    icon: Shield,
    title: "Verified Listings",
    description: "All properties are verified to ensure authenticity and trust",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Get AI-powered price predictions and market trends",
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Your subscription activates immediately after payment",
  },
];

type PricingPlan = (typeof plans)[number];

const PLAN_API_KEY: Record<string, "day" | "weekly" | "monthly"> = {
  day: "day",
  weekly: "weekly",
  monthly: "monthly",
};

function PricingCard({
  plan,
  index,
  user,
  onSubscribe,
}: {
  plan: PricingPlan;
  index: number;
  user: boolean;
  onSubscribe: () => void;
}) {
  const Icon = plan.icon as LucideIcon;
  const isPopular = plan.popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative flex flex-col rounded-2xl p-8 ${
        isPopular
          ? "z-10 scale-[1.02] border-2 border-accent bg-primary text-white shadow-2xl md:scale-105"
          : "border border-border/80 bg-white shadow-lg"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="gap-1.5 border-0 bg-accent px-4 py-1.5 text-sm font-semibold text-primary shadow-md">
            <Star className="h-3.5 w-3.5 fill-current" />
            Most Popular
          </Badge>
        </div>
      )}

      <div
        className={`mb-6 flex h-14 w-14 items-center justify-center rounded-full border ${
          isPopular ? "border-accent/60 bg-primary" : "border-border bg-white"
        }`}
      >
        <Icon
          className={`h-6 w-6 ${isPopular ? "text-accent" : "text-primary"}`}
        />
      </div>

      <div className="mb-6">
        <h3
          className={`mb-2 font-serif text-xl font-semibold ${
            isPopular ? "text-accent" : "text-foreground"
          }`}
        >
          {plan.name}
        </h3>
        <p
          className={`text-sm ${
            isPopular ? "text-white/75" : "text-muted-foreground"
          }`}
        >
          {plan.description}
        </p>
      </div>

      <div className="mb-8 flex items-baseline gap-0.5">
        <IndianRupee
          className={`h-7 w-7 ${isPopular ? "text-accent" : "text-foreground"}`}
        />
        <span
          className={`text-5xl font-bold tracking-tight ${
            isPopular ? "text-accent" : "text-foreground"
          }`}
        >
          {plan.price}
        </span>
        <span
          className={`ml-1 text-base ${
            isPopular ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          /{plan.period}
        </span>
      </div>

      <ul className="mb-8 flex-1 space-y-3.5">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-3">
            {feature.included ? (
              <Check
                className={`h-4 w-4 shrink-0 ${
                  isPopular ? "text-accent" : "text-primary"
                }`}
                strokeWidth={2.5}
              />
            ) : (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30">
                <span className="h-px w-2 rounded bg-muted-foreground/40" />
              </span>
            )}
            <span
              className={
                feature.included
                  ? isPopular
                    ? "text-white/95"
                    : "text-foreground"
                  : "text-muted-foreground/60"
              }
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Button
        className={`h-12 w-full font-semibold ${
          isPopular
            ? "bg-white text-primary hover:bg-white/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
        onClick={onSubscribe}
      >
        {user ? "Get Started" : "Sign Up & Subscribe"}
      </Button>
    </motion.div>
  );
}

export default function PricingPage() {
  const { user, setSubscription } = useAuthStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  const handleSubscribe = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const startRazorpayCheckout = async () => {
    if (!user || !selectedPlan) return;
    const planType = PLAN_API_KEY[selectedPlan.id];
    if (!planType) {
      toast.error("Invalid plan");
      return;
    }
    type RazorpayCtor = new (options: Record<string, unknown>) => {
      open: () => void;
    };
    const Razorpay: RazorpayCtor | undefined =
      typeof window !== "undefined"
        ? (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay
        : undefined;
    if (!Razorpay || typeof Razorpay !== "function") {
      toast.error(
        "Payment is still loading. Please wait a moment and try again.",
      );
      return;
    }

    setPayLoading(true);
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: planType, user_id: user.id }),
      });
      const orderData = (await orderRes.json()) as {
        error?: string;
        key_id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        transaction_id?: string;
        prefill?: { name?: string; email?: string; contact?: string };
      };
      if (!orderRes.ok) {
        toast.error(orderData.error || "Could not start checkout");
        return;
      }
      if (
        !orderData.key_id ||
        !orderData.order_id ||
        orderData.amount == null ||
        !orderData.transaction_id
      ) {
        toast.error("Invalid response from payment server");
        return;
      }

      const rzp = new Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency ?? "INR",
        order_id: orderData.order_id,
        name: "Solvestay",
        description: selectedPlan.name,
        prefill: orderData.prefill,
        theme: { color: "#083B3A" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                transaction_id: orderData.transaction_id,
                plan_type: planType,
                user_id: user.id,
              }),
            });
            const verifyData = (await verifyRes.json()) as {
              error?: string;
              subscription?: Subscription;
            };
            if (!verifyRes.ok) {
              toast.error(verifyData.error || "Payment verification failed");
              return;
            }
            if (verifyData.subscription) {
              setSubscription(verifyData.subscription);
            }
            toast.success("Payment successful! Your plan is active.");
            setCheckoutOpen(false);
            setSelectedPlan(null);
          } catch {
            toast.error(
              "Verification failed. Contact support if you were charged.",
            );
          }
        },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        {/* Hero with faded building imagery */}
        <section className="relative overflow-hidden py-14 sm:py-20">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[22%] lg:block"
            aria-hidden
          >
            <Image
              src={HERO_BUILDING_LEFT}
              alt=""
              fill
              className="object-cover object-right opacity-[0.35]"
              sizes="22vw"
              priority
            />
            <div className="absolute inset-0 bg-background/80" />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[22%] lg:block"
            aria-hidden
          >
            <Image
              src={HERO_BUILDING_RIGHT}
              alt=""
              fill
              className="object-cover object-left opacity-[0.35]"
              sizes="22vw"
              priority
            />
            <div className="absolute inset-0 bg-background/80" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge
                variant="secondary"
                className="mb-6 border border-accent/25 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-accent" />
                Simple, Transparent Pricing
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Choose Your
                <br />
                <span className="font-serif italic text-accent">
                  Perfect Plan
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Unlock direct access to property owners and find your dream home
                faster.
                <br className="hidden sm:inline" /> No brokerage fees, no hidden
                charges.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="pb-20 pt-4">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-stretch gap-6 md:grid-cols-3 md:gap-5 lg:gap-6">
              {plans.map((plan, index) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  index={index}
                  user={!!user}
                  onSubscribe={() => handleSubscribe(plan)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Why Subscribe?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get the most out of your property search with our premium
                features
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-2xl border bg-card"
                >
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-primary px-6 py-14 text-primary-foreground shadow-xl sm:px-12">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
                Ready to Find Your Dream Home?
              </h2>
              <p className="mb-10 text-lg text-primary-foreground/85 sm:text-xl">
                Join thousands of happy customers who found their perfect
                property on Solvestay.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-white px-8 text-lg text-primary hover:bg-white/90"
                >
                  <Link href="/properties">Browse Properties</Link>
                </Button>
                {!user && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-transparent px-8 text-lg text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link href="/auth/register">Create Free Account</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open);
          if (!open) setSelectedPlan(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? selectedPlan.name : "Choose a plan"}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan
                ? `₹${selectedPlan.price} / ${selectedPlan.period} — ${selectedPlan.description}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {!user ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Create an account or sign in to complete your subscription on
                this page.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="flex-1">
                  <Link
                    href="/auth/register"
                    onClick={() => setCheckoutOpen(false)}
                  >
                    Create account
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link
                    href="/auth/login"
                    onClick={() => setCheckoutOpen(false)}
                  >
                    Sign in
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                You will complete payment securely with Razorpay in a popup. You
                can stay on this page.
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={startRazorpayCheckout}
                  disabled={payLoading || !selectedPlan}
                >
                  {payLoading ? "Opening checkout…" : "Pay now"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
