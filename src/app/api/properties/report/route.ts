import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  propertyId: z.string().uuid(),
  propertyTitle: z.string().max(500).optional(),
  reason: z.enum(["Listed by Broker", "Rented Out", "Wrong Info"]),
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { propertyId, propertyTitle, reason } = parsed.data;

  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Sign in to report a listing" },
      { status: 401 },
    );
  }

  const { data: property, error: propError } = await supabaseAdmin
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .maybeSingle();

  if (propError || !property) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const { error: insertError } = await supabaseAdmin
    .from("property_reports")
    .insert({
      property_id: propertyId,
      reporter_id: user.id,
      property_title: propertyTitle?.trim() || null,
      reason,
      status: "open",
    });

  if (insertError) {
    console.error("[property report] insert:", insertError);
    return NextResponse.json(
      { error: "Could not save report. Try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
