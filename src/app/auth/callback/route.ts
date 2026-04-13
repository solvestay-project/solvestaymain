import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/auth/reset-password";
  const nextPath =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : "/auth/reset-password";
  const afterAuth = new URL(nextPath, url.origin);
  afterAuth.searchParams.set("recovery", "1");

  if (code) {
    let response = NextResponse.redirect(afterAuth);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const errUrl = new URL("/auth/forgot-password", url.origin);
      errUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(errUrl);
    }

    return response;
  }

  return NextResponse.redirect(new URL("/auth/forgot-password", url.origin));
}
