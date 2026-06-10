import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  REFERRAL,
  referralAvailablePoints,
  referralCodeFromUserId,
} from "@/lib/referrals";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function ensureReferralCode(userId: string): Promise<string> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .single();

  if (profile?.referral_code) return profile.referral_code;

  let code = referralCodeFromUserId(userId);
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", userId)
      .is("referral_code", null);

    if (!error) return code;

    if (error.message?.includes("referral_code")) {
      code = `${referralCodeFromUserId(userId)}${attempt + 1}`;
      continue;
    }
    throw error;
  }

  const { data: refreshed } = await supabaseAdmin
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .single();

  return refreshed?.referral_code ?? code;
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referralCode = await ensureReferralCode(user.id);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select(
        "referral_points, referral_points_redeemed, referral_wallet_balance_inr",
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      if (
        profileError.message?.includes("referral_points") ||
        profileError.message?.includes("schema cache")
      ) {
        return NextResponse.json({
          referral_code: referralCode,
          points_earned: 0,
          points_redeemed: 0,
          points_available: 0,
          wallet_balance_inr: 0,
          can_redeem: false,
          referrals: [],
          redemptions: [],
          warning:
            "Refer & Earn database columns are missing. Apply the refer_and_earn migration in Supabase.",
        });
      }
      return NextResponse.json(
        { error: "Failed to load referral profile" },
        { status: 500 },
      );
    }

    const pointsEarned = profile?.referral_points ?? 0;
    const pointsRedeemed = profile?.referral_points_redeemed ?? 0;
    const pointsAvailable = referralAvailablePoints(
      pointsEarned,
      pointsRedeemed,
    );

    const { data: referralRows } = await supabaseAdmin
      .from("referral_events")
      .select("id, points_awarded, created_at, referred_user_id")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    let referrals = referralRows ?? [];
    if (referrals.length > 0) {
      const referredIds = referrals.map((r) => r.referred_user_id);
      const { data: referredProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, created_at")
        .in("id", referredIds);

      const profileMap = new Map(
        (referredProfiles ?? []).map((p) => [p.id, p]),
      );
      referrals = referrals.map((r) => ({
        ...r,
        referred_user: profileMap.get(r.referred_user_id) ?? null,
      }));
    }

    const { data: redemptions } = await supabaseAdmin
      .from("referral_redemptions")
      .select("id, points_used, amount_inr, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      referral_code: referralCode,
      points_earned: pointsEarned,
      points_redeemed: pointsRedeemed,
      points_available: pointsAvailable,
      wallet_balance_inr: Number(profile?.referral_wallet_balance_inr ?? 0),
      can_redeem: pointsAvailable >= REFERRAL.REDEEM_MIN_POINTS,
      referrals: referrals ?? [],
      redemptions: redemptions ?? [],
      rules: REFERRAL,
    });
  } catch (error) {
    console.error("Referrals GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
