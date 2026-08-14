import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { applyPropertyTypeBrowseFilter } from "@/lib/property-filters";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q");
    const city = searchParams.get("city");
    const property_type = searchParams.get("property_type");
    const listing_type = searchParams.get("listing_type");
    const min_price = searchParams.get("min_price");
    const max_price = searchParams.get("max_price");
    const bedrooms = searchParams.get("bedrooms");
    const furnishing = searchParams.get("furnishing");
    const amenities = searchParams.get("amenities");
    const sort_by = searchParams.get("sort_by") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("properties")
      .select(
        "*, owner:profiles(id, full_name, phone, avatar_url, is_verified)",
        { count: "exact" }
      )
      .eq("status", "approved")
      .eq("is_active", true)
      .eq("listing_availability", "available");

    if (q) {
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%,locality.ilike.%${q}%`
      );
    }

    if (city && city !== "all") {
      query = query.eq("city", city);
    }

    query = applyPropertyTypeBrowseFilter(
      query,
      property_type && property_type !== "all" ? property_type : undefined,
    );

    if (listing_type && listing_type !== "all") {
      query = query.eq("listing_type", listing_type);
    }

    if (min_price) {
      query = query.gte("price", parseFloat(min_price));
    }

    if (max_price) {
      query = query.lte("price", parseFloat(max_price));
    }

    if (bedrooms) {
      const bedroomList = bedrooms.split(",").map(Number);
      if (bedroomList.includes(4)) {
        query = query.or(
          `bedrooms.in.(${bedroomList.filter((b) => b < 4).join(",")}),bedrooms.gte.4`
        );
      } else {
        query = query.in("bedrooms", bedroomList);
      }
    }

    if (furnishing && furnishing !== "all") {
      query = query.eq("furnishing", furnishing);
    }

    if (amenities) {
      const amenityList = amenities.split(",");
      query = query.contains("amenities", amenityList);
    }

    switch (sort_by) {
      case "price_low":
        query = query.order("price", { ascending: true });
        break;
      case "price_high":
        query = query.order("price", { ascending: false });
        break;
      case "popular":
        query = query.order("views_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Properties query error:", error);
      return NextResponse.json(
        {
          error:
            error.message?.includes("listing_availability") ||
            error.message?.includes("schema cache")
              ? "Failed to fetch properties. Apply the listing_availability migration in Supabase."
              : "Failed to fetch properties",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      properties: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Properties API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, owner_name, owner_phone, ...propertyData } = body;

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Validate required fields
    if (
      !propertyData.title ||
      !propertyData.address ||
      !propertyData.city ||
      !propertyData.price
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let { data: user, error: userError } = await supabase
      .from("profiles")
      .select("role, email, is_verified, verification_status")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const isAdmin = user.role === "admin";
    const isOwner = user.role === "owner";

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        {
          error:
            "Only verified owners or admins can create properties. Please complete owner verification first.",
        },
        { status: 403 }
      );
    }

    if (isOwner && !user.is_verified) {
      return NextResponse.json(
        {
          error:
            "Your account must be verified before you can list properties. Please complete verification first.",
        },
        { status: 403 }
      );
    }

    const trimmedOwnerName =
      typeof owner_name === "string" ? owner_name.trim() : "";
    const trimmedOwnerPhone =
      typeof owner_phone === "string" ? owner_phone.trim() : "";

    if (isAdmin) {
      if (!trimmedOwnerName || !trimmedOwnerPhone) {
        return NextResponse.json(
          { error: "Owner name and owner phone number are required" },
          { status: 400 }
        );
      }
      if (trimmedOwnerPhone.replace(/\D/g, "").length < 10) {
        return NextResponse.json(
          { error: "Please enter a valid owner phone number" },
          { status: 400 }
        );
      }
    }

    // Prefer matching an existing profile by phone when admin lists on behalf of owner
    let resolvedOwnerId = user_id;
    if (isAdmin && trimmedOwnerPhone) {
      const digits = trimmedOwnerPhone.replace(/\D/g, "");
      const last10 = digits.slice(-10);
      const { data: matchedOwners } = await supabase
        .from("profiles")
        .select("id, phone")
        .not("phone", "is", null)
        .limit(200);

      const match = (matchedOwners || []).find((p) => {
        const pDigits = String(p.phone || "").replace(/\D/g, "");
        return pDigits === digits || pDigits.endsWith(last10);
      });

      if (match?.id) {
        resolvedOwnerId = match.id;
      }
    }

    // Prepare insert data - always include images_360 (even if empty array)
    // property_type "pg" may include pg_details (JSONB) for PG/Hostel-specific fields
    const insertData: any = {
      ...propertyData,
      owner_id: resolvedOwnerId,
      status: isAdmin ? "approved" : "pending",
      is_active: isAdmin ? true : false,
      is_verified: isAdmin ? true : false,
      approved_at: isAdmin ? new Date().toISOString() : null,
      listing_availability:
        propertyData.listing_availability === "sold_out"
          ? "sold_out"
          : "available",
    };

    if (isAdmin) {
      insertData.owner_name = trimmedOwnerName;
      insertData.owner_phone = trimmedOwnerPhone;
    } else {
      // Owners should not set contact override columns via this endpoint
      delete insertData.owner_name;
      delete insertData.owner_phone;
    }

    // Always include images_360 - ensure it's an array
    insertData.images_360 = Array.isArray(propertyData.images_360)
      ? propertyData.images_360
      : propertyData.images_360
        ? [propertyData.images_360]
        : [];

    console.log("📝 Inserting property with images_360:", {
      images_360_count: insertData.images_360.length,
      images_360: insertData.images_360,
      isAdmin,
      owner_id: resolvedOwnerId,
    });

    // Set property status to pending for admin review (or approved if created by admin)
    let { data, error } = await supabase
      .from("properties")
      .insert(insertData)
      .select()
      .single();

    // If error is about missing column (e.g. images_360, pg_details), provide helpful error message
    if (
      error &&
      (error.message?.includes("images_360") ||
        error.message?.includes("pg_details") ||
        error.message?.includes("nearby_places") ||
        error.message?.includes("owner_name") ||
        error.message?.includes("owner_phone") ||
        error.message?.includes("column") ||
        error.code === "PGRST116")
    ) {
      console.error(
        "❌ Database error (missing column):",
        error.message
      );
      if (error.message?.includes("pg_details")) {
        console.error(
          "💡 For PG/Hostel listings, add: ALTER TABLE properties ADD COLUMN IF NOT EXISTS pg_details JSONB DEFAULT NULL;"
        );
      }
      if (error.message?.includes("images_360")) {
        console.error(
          "💡 Add: ALTER TABLE properties ADD COLUMN images_360 TEXT[] DEFAULT '{}';"
        );
      }
      if (
        error.message?.includes("owner_name") ||
        error.message?.includes("owner_phone")
      ) {
        console.error(
          "💡 Add: ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_name TEXT, ADD COLUMN IF NOT EXISTS owner_phone TEXT;"
        );
      }

      // Try without optional columns as fallback
      const { images_360, pg_details, nearby_places, owner_name: on, owner_phone: op, ...rest } =
        insertData;
      const retryData: any = { ...rest };
      if (!error.message?.includes("images_360")) retryData.images_360 = insertData.images_360;
      if (!error.message?.includes("pg_details") && insertData.pg_details != null)
        retryData.pg_details = insertData.pg_details;
      if (!error.message?.includes("nearby_places") && insertData.nearby_places != null)
        retryData.nearby_places = insertData.nearby_places;
      if (
        !error.message?.includes("owner_name") &&
        !error.message?.includes("owner_phone")
      ) {
        if (insertData.owner_name) retryData.owner_name = insertData.owner_name;
        if (insertData.owner_phone) retryData.owner_phone = insertData.owner_phone;
      }

      console.warn("⚠️ Retrying without missing optional columns...");
      const missingOwnerContact =
        error.message?.includes("owner_name") ||
        error.message?.includes("owner_phone");
      const retryResult = await supabase
        .from("properties")
        .insert(retryData)
        .select()
        .single();

      if (retryResult.error) {
        return NextResponse.json(
          {
            error: `Failed to create property: ${retryResult.error.message}. Note: a required column may be missing from the database.`,
          },
          { status: 500 }
        );
      }

      data = retryResult.data;
      error = null;

      // Return warning about missing column
      return NextResponse.json({
        success: true,
        property: data,
        warning: missingOwnerContact
          ? "Property created but owner contact fields were not saved. Apply the owner_name/owner_phone migration."
          : "Property created but some optional fields were not saved. Please check database migrations.",
      });
    }

    if (error) {
      console.error("Property creation error:", error);
      return NextResponse.json(
        { error: `Failed to create property: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, property: data });
  } catch (error) {
    console.error("Property creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
