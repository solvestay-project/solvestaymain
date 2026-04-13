"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useAuthStore } from "@/lib/store";
import { planDisplayNameFromType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  MessageSquare,
  Heart,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, subscription, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalContacts: 0,
    activeListings: 0,
    pendingListings: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setIsLoading(false);
      router.replace("/auth/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (!profile) {
      setIsLoading(false);
      router.replace("/auth/login");
      return;
    }

    if (profile.role === "owner") {
      setIsLoading(false);
      router.replace("/dashboard/owner");
      return;
    }
    if (profile.role === "admin") {
      setIsLoading(false);
      router.replace("/admin");
      return;
    }

    setUser(profile);
    await fetchCustomerData(profile.id);
  };

  const fetchCustomerData = async (customerId: string) => {
    const supabase = createClient();

    const { data: favoritesData } = await supabase
      .from("favorites")
      .select("*, property:properties(*)")
      .eq("user_id", customerId);

    if (favoritesData) {
      setStats((prev) => ({ ...prev, activeListings: favoritesData.length }));
    }

    setIsLoading(false);
  };

  if (isLoading || !user || user.role !== "customer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your home search</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.full_name?.split(" ")[0] || "User"}. Track
                favorites, messages, and your subscription.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={subscription ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg">Subscription Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div>
                      <Badge className="mb-3 font-medium text-left whitespace-normal h-auto py-1.5 px-2.5">
                        {planDisplayNameFromType(subscription.plan_type)}
                      </Badge>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Contacts Used
                          </span>
                          <span className="font-medium">
                            {subscription.contacts_used} /{" "}
                            {subscription.contacts_limit === -1
                              ? "∞"
                              : subscription.contacts_limit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires</span>
                          <span className="font-medium">
                            {new Date(subscription.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">
                        No active subscription
                      </p>
                      <Button asChild>
                        <Link href="/pricing">Get Started</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Saved Properties
                  </CardTitle>
                  <Heart className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.activeListings}</div>
                  <Button asChild variant="link" className="px-0 mt-2">
                    <Link href="/dashboard/favorites">View all favorites</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/properties">
                      <Building2 className="w-4 h-4 mr-2" />
                      Browse Properties
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/dashboard/messages">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                Properties matching your search history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Start exploring</h3>
                <p className="text-muted-foreground mb-4">
                  Browse properties to get personalized recommendations
                </p>
                <Button asChild>
                  <Link href="/properties">Browse Properties</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
