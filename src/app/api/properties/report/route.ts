import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  propertyId: z.string().min(1).max(128),
  propertyTitle: z.string().max(500).optional(),
  reason: z.enum(["Listed by Broker", "Rented Out", "Wrong Info"]),
});

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

  // Hook for persistence (e.g. Supabase table `property_reports`)
  if (process.env.NODE_ENV === "development") {
    console.info("[property report]", { propertyId, propertyTitle, reason });
  }

  return NextResponse.json({ ok: true });
}
