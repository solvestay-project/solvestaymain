import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  REFERRAL,
  referralAvailablePoints,
} from "@/lib/referrals";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select(
        "referral_points, referral_points_redeemed, referral_wallet_balance_inr",
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        {
          error:
            profileError.message?.includes("referral_points") ||
            profileError.message?.includes("schema cache")
              ? "Refer & Earn is not set up yet. Apply the database migration first."
              : "Failed to load profile",
        },
        { status: 500 },
      );
    }

    const pointsEarned = profile?.referral_points ?? 0;
    const pointsRedeemed = profile?.referral_points_redeemed ?? 0;
    const available = referralAvailablePoints(pointsEarned, pointsRedeemed);

    if (available < REFERRAL.REDEEM_MIN_POINTS) {
      return NextResponse.json(
        {
          error: `You need at least ${REFERRAL.REDEEM_MIN_POINTS} points to redeem.`,
          points_available: available,
        },
        { status: 400 },
      );
    }

    const newPointsRedeemed = pointsRedeemed + REFERRAL.REDEEM_MIN_POINTS;
    const newWallet =
      Number(profile?.referral_wallet_balance_inr ?? 0) +
      REFERRAL.REDEEM_AMOUNT_INR;

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        referral_points_redeemed: newPointsRedeemed,
        referral_wallet_balance_inr: newWallet,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Referral redeem update error:", updateError);
      return NextResponse.json(
        { error: "Failed to redeem points" },
        { status: 500 },
      );
    }

    const { data: redemption, error: redemptionError } = await supabaseAdmin
      .from("referral_redemptions")
      .insert({
        user_id: user.id,
        points_used: REFERRAL.REDEEM_MIN_POINTS,
        amount_inr: REFERRAL.REDEEM_AMOUNT_INR,
        status: "completed",
      })
      .select()
      .single();

    if (redemptionError) {
      console.error("Referral redemption log error:", redemptionError);
    }

    return NextResponse.json({
      success: true,
      points_redeemed: REFERRAL.REDEEM_MIN_POINTS,
      amount_inr: REFERRAL.REDEEM_AMOUNT_INR,
      wallet_balance_inr: newWallet,
      points_available: referralAvailablePoints(pointsEarned, newPointsRedeemed),
      redemption,
    });
  } catch (error) {
    console.error("Referrals redeem error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
