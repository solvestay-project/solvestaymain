"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { REFERRAL, buildReferralLink, whatsAppShareUrl } from "@/lib/referrals";
import type { ReferralEvent, ReferralRedemption } from "@/lib/types";
import { toast } from "sonner";
import {
  Gift,
  Share2,
  Copy,
  Check,
  IndianRupee,
  Users,
  Loader2,
  ArrowRight,
} from "lucide-react";

type ReferralData = {
  referral_code: string;
  points_earned: number;
  points_redeemed: number;
  points_available: number;
  wallet_balance_inr: number;
  can_redeem: boolean;
  referrals: ReferralEvent[];
  redemptions: ReferralRedemption[];
  warning?: string;
};

const steps = [
  {
    title: "Share your link",
    description:
      "Send your unique referral link to friends on WhatsApp or social media.",
  },
  {
    title: "Friend signs up",
    description: `You earn ${REFERRAL.POINTS_PER_REFERRAL} points when they create an account using your link.`,
  },
  {
    title: "Redeem for ₹50",
    description: `Collect ${REFERRAL.REDEEM_MIN_POINTS} points and redeem for ₹${REFERRAL.REDEEM_AMOUNT_INR} subscription credit.`,
  },
];

export default function ReferAndEarnPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadReferrals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/referrals/me");
      const json = (await res.json()) as ReferralData & { error?: string };
      if (!res.ok) {
        toast.error(json.error || "Failed to load referral data");
        return;
      }
      if (json.warning) toast.warning(json.warning);
      setData(json);
    } catch {
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const referralLink =
    data?.referral_code && typeof window !== "undefined"
      ? buildReferralLink(window.location.origin, data.referral_code)
      : "";

  const shareMessage = referralLink
    ? `Join Solvestay — find homes with zero brokerage! Sign up with my link and help me earn rewards: ${referralLink}`
    : "";

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Solvestay",
          text: shareMessage,
          url: referralLink,
        });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    window.open(
      whatsAppShareUrl(shareMessage),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      const res = await fetch("/api/referrals/redeem", { method: "POST" });
      const json = (await res.json()) as {
        error?: string;
        amount_inr?: number;
        wallet_balance_inr?: number;
      };
      if (!res.ok) {
        toast.error(json.error || "Redemption failed");
        return;
      }
      toast.success(
        `Redeemed ₹${json.amount_inr}! Credit added to your wallet.`,
      );
      await loadReferrals();
    } catch {
      toast.error("Redemption failed");
    } finally {
      setRedeeming(false);
    }
  };

  const progressPct = data
    ? Math.min(100, (data.points_available / REFERRAL.REDEEM_MIN_POINTS) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
              <Gift className="w-3.5 h-3.5 mr-1" />
              Refer & Earn
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Share Solvestay, earn rewards
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Invite friends to Solvestay. Earn {REFERRAL.POINTS_PER_REFERRAL}{" "}
              points per signup — redeem {REFERRAL.REDEEM_MIN_POINTS} points for
              ₹{REFERRAL.REDEEM_AMOUNT_INR} subscription credit.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="p-5 rounded-xl border bg-card text-center"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {!user ? (
            <div className="p-8 rounded-2xl border bg-card text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Sign in to get your link
              </h2>
              <p className="text-muted-foreground mb-6">
                Create an account or sign in to generate your referral link and
                start earning points.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/auth/register">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
          ) : loading && !data ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl border bg-primary/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Your points
                    </p>
                    <p className="text-3xl font-bold">
                      {data.points_available}{" "}
                      <span className="text-lg font-normal text-muted-foreground">
                        / {REFERRAL.REDEEM_MIN_POINTS}
                      </span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      Wallet credit
                    </p>
                    <p className="text-2xl font-bold text-primary flex items-center gap-1 sm:justify-end">
                      <IndianRupee className="w-5 h-5" />
                      {data.wallet_balance_inr.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="mb-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  {data.can_redeem
                    ? "You can redeem now!"
                    : `${REFERRAL.REDEEM_MIN_POINTS - data.points_available} more points to redeem ₹${REFERRAL.REDEEM_AMOUNT_INR}`}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <div className="flex-1 px-4 py-3 rounded-lg bg-background border text-sm font-mono truncate">
                    {referralLink || "Loading link…"}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" onClick={handleCopy}>
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Code:{" "}
                  <span className="font-semibold text-foreground">
                    {data.referral_code}
                  </span>{" "}
                  · 1 referral = {REFERRAL.POINTS_PER_REFERRAL} pts (₹
                  {(
                    REFERRAL.POINTS_PER_REFERRAL * REFERRAL.POINTS_TO_INR
                  ).toFixed(0)}
                  )
                </p>

                <Button
                  className="w-full sm:w-auto"
                  disabled={!data.can_redeem || redeeming}
                  onClick={handleRedeem}
                >
                  {redeeming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redeeming…
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Redeem {REFERRAL.REDEEM_MIN_POINTS} pts for ₹
                      {REFERRAL.REDEEM_AMOUNT_INR}
                    </>
                  )}
                </Button>

                {data.wallet_balance_inr > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Wallet credit applies automatically on your next
                    subscription purchase at{" "}
                    <Link
                      href="/pricing"
                      className="text-primary hover:underline"
                    >
                      Pricing
                    </Link>
                    .
                  </p>
                )}
              </div>

              {data.referrals.length > 0 && (
                <div className="p-6 rounded-xl border bg-card">
                  <h3 className="font-semibold mb-4">Recent referrals</h3>
                  <ul className="space-y-3">
                    {data.referrals.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {r.referred_user?.full_name ||
                            r.referred_user?.email ||
                            "New user"}
                        </span>
                        <span className="text-primary font-medium">
                          +{r.points_awarded} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.redemptions.length > 0 && (
                <div className="p-6 rounded-xl border bg-card">
                  <h3 className="font-semibold mb-4">Redemption history</h3>
                  <ul className="space-y-3">
                    {data.redemptions.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </span>
                        <span className="font-medium">
                          ₹{Number(r.amount_inr).toFixed(0)} credit
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-10 p-5 rounded-xl bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Terms</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                {REFERRAL.POINTS_PER_REFERRAL} points per friend who signs up
                using your referral link.
              </li>
              <li>
                Redeem {REFERRAL.REDEEM_MIN_POINTS} points for ₹
                {REFERRAL.REDEEM_AMOUNT_INR} subscription wallet credit.
              </li>
              <li>Self-referrals and duplicate accounts are not eligible.</li>
              <li>
                Points have no cash value outside Solvestay subscriptions.
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
