"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthStore, useNotificationStore } from "@/lib/store";
import {
  planDisplayNameFromType,
  subscriptionIncludesPrioritySupport,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Building2,
  Search,
  User,
  LogOut,
  Settings,
  Heart,
  MessageSquare,
  LayoutDashboard,
  Plus,
  Bell,
  CreditCard,
  Shield,
  ShieldCheck,
  Calendar,
  Headphones,
  Gift,
  Sparkles,
} from "lucide-react";

type NavKey =
  | "home"
  | "post"
  | "properties"
  | "rent"
  | "buy"
  | "pg"
  | "ai"
  | "pricing"
  | "refer"
  | "priority"
  | "account"
  | "add"
  | "listings"
  | "owner-home";

function getActiveNavKey(
  pathname: string,
  searchParams: URLSearchParams,
): NavKey | null {
  if (pathname === "/") return "home";
  if (pathname === "/ai-search") return "ai";
  if (pathname === "/auth/register" && searchParams.get("role") === "owner") {
    return "post";
  }
  if (pathname === "/pricing") return "pricing";
  if (pathname === "/refer-and-earn") return "refer";
  if (pathname === "/support/priority") return "priority";
  if (pathname === "/dashboard/owner") return "owner-home";
  if (pathname === "/dashboard/properties/new") return "add";
  if (
    pathname.startsWith("/dashboard/properties") &&
    pathname !== "/dashboard/properties/new"
  ) {
    return "listings";
  }
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/auth/") ||
    pathname === "/admin"
  ) {
    return "account";
  }

  if (pathname === "/properties") {
    const propertyType = searchParams.get("property_type");
    const listingType = searchParams.get("listing_type");
    if (propertyType === "pg") return "pg";
    if (listingType === "rent" || listingType === "lease") return "rent";
    if (listingType === "sale") return "buy";
    return "properties";
  }

  if (pathname.startsWith("/properties/")) {
    return "properties";
  }

  return null;
}

function desktopNavClass(isActive: boolean) {
  return cn(
    "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
    isActive
      ? "bg-primary/10 text-primary font-semibold"
      : "text-foreground/80 hover:bg-primary/5 hover:text-primary",
  );
}

function bottomNavItemClass(isActive: boolean) {
  return cn(
    "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-all min-w-0",
    isActive ? "text-accent font-semibold" : "text-white/72",
  );
}

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeNav = getActiveNavKey(pathname, searchParams);
  const { user, subscription, logout, hasActiveSubscription } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("signOut timeout")), 12_000),
        ),
      ]);
    } catch {
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
    }
    logout();
    router.push("/");
    router.refresh();
  };

  const hideCustomerBrowseNav = user?.role === "owner";
  const brandHref = user?.role === "owner" ? "/dashboard/owner" : "/";
  const dashboardHref =
    user?.role === "owner"
      ? "/dashboard/owner"
      : user?.role === "admin"
        ? "/admin"
        : "/dashboard/customer";

  const showPrioritySupportNav =
    user?.role === "customer" &&
    hasActiveSubscription() &&
    subscriptionIncludesPrioritySupport(subscription);

  // Reserve space for fixed bottom nav on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      document.body.style.paddingBottom = mq.matches
        ? "calc(5.25rem + env(safe-area-inset-bottom, 0px))"
        : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.paddingBottom = "";
    };
  }, []);

  const customerBottomItems: {
    href: string;
    label: string;
    icon: typeof Home;
    key: NavKey;
  }[] = [
    { href: "/", label: "Home", icon: Home, key: "home" },
    { href: "/properties", label: "Search", icon: Search, key: "properties" },
    { href: "/ai-search", label: "AI", icon: Sparkles, key: "ai" },
    { href: "/pricing", label: "Plans", icon: CreditCard, key: "pricing" },
    {
      href: user ? dashboardHref : "/auth/login",
      label: user ? "Account" : "Sign in",
      icon: User,
      key: "account",
    },
  ];

  const ownerBottomItems: {
    href: string;
    label: string;
    icon: typeof Home;
    key: NavKey;
  }[] = [
    {
      href: "/dashboard/owner",
      label: "Home",
      icon: LayoutDashboard,
      key: "owner-home",
    },
    {
      href: "/dashboard/properties",
      label: "Listings",
      icon: Building2,
      key: "listings",
    },
    {
      href: "/dashboard/properties/new",
      label: "Add",
      icon: Plus,
      key: "add",
    },
    { href: "/refer-and-earn", label: "Refer", icon: Gift, key: "refer" },
    {
      href: "/dashboard/settings",
      label: "Account",
      icon: User,
      key: "account",
    },
  ];

  const bottomItems = hideCustomerBrowseNav
    ? ownerBottomItems
    : customerBottomItems;

  const isBottomActive = (key: NavKey) => {
    if (key === "properties") {
      return (
        activeNav === "properties" ||
        activeNav === "rent" ||
        activeNav === "buy" ||
        activeNav === "pg"
      );
    }
    if (key === "account") {
      return (
        activeNav === "account" ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/auth/")
      );
    }
    return activeNav === key;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/70 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href={brandHref} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">
                Solvestay
              </span>
            </Link>

            {!hideCustomerBrowseNav && (
              <nav className="hidden lg:flex items-center gap-1">
                <Link
                  href="/auth/register?role=owner"
                  className={desktopNavClass(activeNav === "post")}
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Post Properties
                  </span>
                </Link>
                <Link
                  href="/properties?listing_type=rent"
                  className={desktopNavClass(activeNav === "rent")}
                >
                  Rent
                </Link>
                <Link
                  href="/properties?listing_type=sale"
                  className={desktopNavClass(activeNav === "buy")}
                >
                  Buy
                </Link>
                <Link
                  href="/properties?property_type=pg"
                  className={desktopNavClass(activeNav === "pg")}
                >
                  PG/Hostel
                </Link>

                <Link
                  href="/pricing"
                  className={desktopNavClass(activeNav === "pricing")}
                >
                  Pricing
                </Link>
                <Link
                  href="/refer-and-earn"
                  className={desktopNavClass(activeNav === "refer")}
                >
                  <span className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Refer & Earn
                  </span>
                </Link>

                <Link
                  href="/ai-search"
                  className={desktopNavClass(activeNav === "ai")}
                >
                  <span className="flex items-center gap-2">
                    <span className="ai-sparkle-wrap relative inline-flex h-7 w-7 items-center justify-center rounded-full">
                      <Sparkles
                        className="relative h-4 w-4 text-white animate-ai-sparkle"
                        strokeWidth={2.25}
                      />
                    </span>
                    AI Search
                  </span>
                </Link>
                {showPrioritySupportNav && (
                  <Link
                    href="/support/priority"
                    className={desktopNavClass(activeNav === "priority")}
                  >
                    <span className="flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      Priority support
                    </span>
                  </Link>
                )}
              </nav>
            )}

            {hideCustomerBrowseNav && (
              <nav className="hidden lg:flex items-center gap-1">
                <Link
                  href="/refer-and-earn"
                  className={desktopNavClass(activeNav === "refer")}
                >
                  <span className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Refer & Earn
                  </span>
                </Link>
              </nav>
            )}

            {/* Desktop auth */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  {user.role === "customer" &&
                    hasActiveSubscription() &&
                    subscription && (
                      <div
                        className="px-3 py-1.5 bg-primary/10 rounded-lg text-sm max-w-[min(100vw-12rem,280px)] truncate"
                        title={planDisplayNameFromType(subscription.plan_type)}
                      >
                        <span className="text-muted-foreground">Plan: </span>
                        <span className="font-semibold text-primary">
                          {planDisplayNameFromType(subscription.plan_type)}
                        </span>
                      </div>
                    )}

                  {user.role === "owner" && (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/properties/new">
                        <Plus className="w-4 h-4 mr-2" />
                        List Property
                      </Link>
                    </Button>
                  )}

                  {user.role === "admin" && (
                    <Button asChild variant="default" size="sm">
                      <Link href="/admin">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </Button>
                  )}

                  <Link
                    href="/dashboard/notifications"
                    className="relative p-2 rounded-lg hover:bg-muted"
                  >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.avatar_url || ""}
                            alt={user.full_name || ""}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.full_name?.charAt(0) ||
                              user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {user.full_name && (
                            <p className="font-medium">{user.full_name}</p>
                          )}
                          <p className=" w-50 truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <Badge
                            variant="secondary"
                            className={`w-fit text-xs capitalize ${
                              user.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : user.role === "owner"
                                  ? "bg-amber-100 text-amber-700"
                                  : ""
                            }`}
                          >
                            {user.role === "admin" && (
                              <Shield className="w-3 h-3 mr-1" />
                            )}
                            {user.role === "owner" && (
                              <Building2 className="w-3 h-3 mr-1" />
                            )}
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenuSeparator />

                      {user.role === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4 text-primary" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem asChild>
                        <Link href={dashboardHref}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>

                      {user.role === "owner" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/properties">
                              <Building2 className="mr-2 h-4 w-4" />
                              My Properties
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/visits">
                              <Calendar className="mr-2 h-4 w-4" />
                              Visit Requests
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/verify">
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Verification
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {user.role === "customer" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/favorites">
                              <Heart className="mr-2 h-4 w-4" />
                              Favorites
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/pricing">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Subscription
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/messages">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Messages
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/refer-and-earn">
                          <Gift className="mr-2 h-4 w-4" />
                          Refer & Earn
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile top actions — no hamburger */}
            <div className="flex lg:hidden items-center gap-1">
              {user ? (
                <Link
                  href="/dashboard/notifications"
                  className="relative p-2 rounded-lg hover:bg-muted"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              ) : (
                <Button asChild variant="ghost" size="sm" className="text-sm">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile app-style bottom navigation */}
      <nav
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-3 z-50 mx-auto max-w-lg lg:hidden"
        aria-label="Mobile primary"
      >
        <div className="glass-bottom-nav flex h-16 items-stretch rounded-3xl px-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isBottomActive(item.key);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={bottomNavItemClass(active)}
              >
                <span
                  className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full transition-all",
                    item.key === "ai"
                      ? "ai-sparkle-wrap"
                      : active &&
                          "bg-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-white/28 backdrop-blur-sm",
                  )}
                >
                  {item.key === "ai" ? (
                    <Sparkles
                      className="relative h-5 w-5 text-white animate-ai-sparkle"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active ? "text-accent" : "text-white/88",
                      )}
                      strokeWidth={active ? 2.25 : 1.75}
                    />
                  )}
                </span>
                <span className="truncate w-full text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}
