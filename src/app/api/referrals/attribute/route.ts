import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { REFERRAL } from "@/lib/referrals";

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

    const body = await request.json().catch(() => ({}));
    const referralCode =
      typeof body.referral_code === "string"
        ? body.referral_code.trim().toUpperCase()
        : "";

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 },
      );
    }

    const { data: newUser, error: newUserError } = await supabaseAdmin
      .from("profiles")
      .select("id, referred_by, referral_code")
      .eq("id", user.id)
      .single();

    if (newUserError || !newUser) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (newUser.referred_by) {
      return NextResponse.json({
        success: true,
        message: "Referral already attributed",
        already_attributed: true,
      });
    }

    if (newUser.referral_code?.toUpperCase() === referralCode) {
      return NextResponse.json(
        { error: "You cannot use your own referral code" },
        { status: 400 },
      );
    }

    const { data: referrer, error: referrerError } = await supabaseAdmin
      .from("profiles")
      .select("id, referral_points")
      .eq("referral_code", referralCode)
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 },
      );
    }

    if (referrer.id === user.id) {
      return NextResponse.json(
        { error: "You cannot use your own referral code" },
        { status: 400 },
      );
    }

    const { data: existingEvent } = await supabaseAdmin
      .from("referral_events")
      .select("id")
      .eq("referred_user_id", user.id)
      .maybeSingle();

    if (existingEvent) {
      return NextResponse.json({
        success: true,
        message: "Referral already recorded",
        already_attributed: true,
      });
    }

    const { error: linkError } = await supabaseAdmin
      .from("profiles")
      .update({ referred_by: referrer.id })
      .eq("id", user.id)
      .is("referred_by", null);

    if (linkError) {
      console.error("Referral link error:", linkError);
      return NextResponse.json(
        { error: "Failed to attribute referral" },
        { status: 500 },
      );
    }

    const { error: eventError } = await supabaseAdmin
      .from("referral_events")
      .insert({
        referrer_id: referrer.id,
        referred_user_id: user.id,
        event_type: "signup",
        points_awarded: REFERRAL.POINTS_PER_REFERRAL,
      });

    if (eventError) {
      console.error("Referral event error:", eventError);
      return NextResponse.json(
        { error: "Failed to record referral event" },
        { status: 500 },
      );
    }

    const { error: pointsError } = await supabaseAdmin
      .from("profiles")
      .update({
        referral_points:
          (referrer.referral_points ?? 0) + REFERRAL.POINTS_PER_REFERRAL,
      })
      .eq("id", referrer.id);

    if (pointsError) {
      console.error("Referral points error:", pointsError);
      return NextResponse.json(
        { error: "Failed to award referral points" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      points_awarded: REFERRAL.POINTS_PER_REFERRAL,
      referrer_id: referrer.id,
    });
  } catch (error) {
    console.error("Referrals attribute error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
