import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const recoveryPending =
    request.cookies.get("password_recovery")?.value === "1";
  const authCode = request.nextUrl.searchParams.get("code");

  // Email reset links sometimes land on site root with ?code= — send to reset page
  if (authCode && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/reset-password";
    return NextResponse.redirect(url);
  }

  // Password reset link creates a session — stay on reset page until done
  if (
    user &&
    recoveryPending &&
    pathname !== "/auth/reset-password" &&
    !pathname.startsWith("/api/auth/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/reset-password";
    url.searchParams.set("recovery", "1");
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/owner";
      return NextResponse.redirect(url);
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/properties",
    "/pricing",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/properties/")
  );

  // Protected routes
  const isAuthRoute = pathname.startsWith("/auth/");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api");

  // Redirect unauthenticated users away from protected routes
  if (!user && (isDashboardRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages (except login/register for account switching)
  // Allow access to login/register pages even if logged in (users might want to switch accounts)
  if (
    user &&
    isAuthRoute &&
    pathname !== "/auth/logout" &&
    pathname !== "/auth/login" &&
    pathname !== "/auth/register" &&
    pathname !== "/auth/forgot-password" &&
    pathname !== "/auth/reset-password" &&
    pathname !== "/auth/callback"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin routes require admin role - this will be checked in the layout/API
  // We can't easily check role in middleware without additional DB calls
  // So we'll rely on the admin layout and API routes for role checking

  return supabaseResponse;
}
