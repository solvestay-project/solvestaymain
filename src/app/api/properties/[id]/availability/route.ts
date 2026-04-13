import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const listing_availability = body?.listing_availability as string | undefined;
    if (listing_availability !== "available" && listing_availability !== "sold_out") {
      return NextResponse.json(
        { error: "listing_availability must be 'available' or 'sold_out'" },
        { status: 400 }
      );
    }

    const { data: row, error: fetchError } = await supabaseAdmin
      .from("properties")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (row.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("properties")
      .update({
        listing_availability,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    const msg = error?.message ?? "";
    if (
      error &&
      (msg.includes("listing_availability") || msg.includes("schema cache"))
    ) {
      return NextResponse.json(
        {
          error:
            "Database is missing listing_availability. Run the migration in Supabase (add column listing_availability).",
        },
        { status: 500 }
      );
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, property: data });
  } catch (e) {
    console.error("availability PATCH:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
