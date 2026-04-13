import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Owner dashboard metrics backed by real tables (not denormalized counters).
 */
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

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { count, error: countError } = await supabaseAdmin
      .from("contact_reveals")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id);

    if (countError) {
      console.error("owner-stats contact_reveals count:", countError);
      return NextResponse.json(
        { error: "Failed to load contact stats" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      contact_reveals_count: count ?? 0,
    });
  } catch (e) {
    console.error("owner-stats error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
