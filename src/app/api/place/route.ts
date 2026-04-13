import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/place?q=Marathahalli,Bengaluru
 * Proxies Nominatim (OpenStreetMap) for place/city/area lookup.
 * Used for: 1) City selection, 2) Area/locality within a city.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10) || 6, 10);

    if (!q || !q.trim()) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
        q: q.trim(),
        format: "json",
        addressdetails: "1",
        limit: String(limit),
      })}`,
      {
        headers: {
          "User-Agent": "orchids-property-marketplace/1.0",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Place lookup failed" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        success: true,
        places: [],
        message: "No places found",
      });
    }

    const places = data.map((place: any) => {
      const addr = place.address || {};
      return {
        display_name: place.display_name,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        type: place.type || null,
        area:
          addr.suburb ||
          addr.village ||
          addr.neighbourhood ||
          addr.hamlet ||
          null,
        city: addr.city || addr.town || addr.municipality || addr.county || null,
        state: addr.state || null,
        country: addr.country || null,
        postcode: addr.postcode || null,
      };
    });

    return NextResponse.json({ success: true, places });
  } catch (error) {
    console.error("Place API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
