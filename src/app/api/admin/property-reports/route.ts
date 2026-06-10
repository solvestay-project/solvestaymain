import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function verifyAdmin(userId: string) {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !profile || profile.role !== "admin") return false;
  return true;
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

    if (!(await verifyAdmin(user.id))) {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    const { data: reports, error } = await supabaseAdmin
      .from("property_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      console.error("property_reports fetch:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 },
      );
    }

    const rows = reports ?? [];
    const propertyIds = [...new Set(rows.map((r) => r.property_id))];
    const reporterIds = [...new Set(rows.map((r) => r.reporter_id))];

    const [propsRes, profsRes] = await Promise.all([
      propertyIds.length
        ? supabaseAdmin
            .from("properties")
            .select("id, title, city, status, is_active")
            .in("id", propertyIds)
        : Promise.resolve({ data: [] as const }),
      reporterIds.length
        ? supabaseAdmin
            .from("profiles")
            .select("id, full_name, email")
            .in("id", reporterIds)
        : Promise.resolve({ data: [] as const }),
    ]);

    const propMap = new Map(
      (propsRes.data ?? []).map((p) => [p.id, p] as const),
    );
    const profMap = new Map(
      (profsRes.data ?? []).map((p) => [p.id, p] as const),
    );

    const enriched = rows.map((r) => ({
      ...r,
      property: propMap.get(r.property_id) ?? null,
      reporter: profMap.get(r.reporter_id) ?? null,
    }));

    return NextResponse.json({ success: true, reports: enriched });
  } catch (e) {
    console.error("admin property-reports GET:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
