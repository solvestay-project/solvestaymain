/** Refer & Earn program constants */
export const REFERRAL = {
  /** Points awarded when a friend signs up via your link */
  POINTS_PER_REFERRAL: 50,
  /** Minimum points required to redeem */
  REDEEM_MIN_POINTS: 500,
  /** INR credit granted per redemption */
  REDEEM_AMOUNT_INR: 50,
  /** 10 points = ₹1 at redemption (50 pts = ₹5 per referral) */
  POINTS_TO_INR: 0.1,
} as const

export function referralCodeFromUserId(userId: string): string {
  const base = userId.replace(/-/g, "").slice(0, 8).toUpperCase()
  return `SS-${base}`
}

export function referralAvailablePoints(
  earned: number,
  redeemed: number,
): number {
  return Math.max(0, earned - redeemed)
}

export function canRedeemReferralPoints(
  earned: number,
  redeemed: number,
): boolean {
  return referralAvailablePoints(earned, redeemed) >= REFERRAL.REDEEM_MIN_POINTS
}

export function buildReferralLink(origin: string, code: string): string {
  const base = origin.replace(/\/$/, "")
  return `${base}/auth/register?ref=${encodeURIComponent(code)}`
}

export function whatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
