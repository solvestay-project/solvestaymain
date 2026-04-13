"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ListingAvailability, Property } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import {
  Plus,
  Home,
  Eye,
  Phone,
  Heart,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const statusConfig = {
  approved: {
    label: "Live",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
  draft: { label: "Draft", icon: Edit, className: "bg-gray-100 text-gray-700" },
};

export default function MyPropertiesPage() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(5); // km
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [updatingAvailabilityId, setUpdatingAvailabilityId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setProperties(data as Property[]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user live location on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Haversine formula for distance in km
  function getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const filteredProperties = properties.filter((property) => {
    if (
      nearbyEnabled &&
      userLocation &&
      typeof property.latitude === "number" &&
      typeof property.longitude === "number"
    ) {
      const dist = getDistanceKm(
        userLocation[0],
        userLocation[1],
        property.latitude,
        property.longitude
      );
      if (dist > nearbyRadius) return false;
    } else if (nearbyEnabled && !userLocation) {
      return false;
    }
    return true;
  });
  const setListingAvailability = async (
    property: Property,
    next: ListingAvailability
  ) => {
    const current = property.listing_availability ?? "available";
    if (current === next) return;

    setUpdatingAvailabilityId(property.id);
    try {
      const res = await fetch(`/api/properties/${property.id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_availability: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setProperties((prev) =>
        prev.map((p) =>
          p.id === property.id ? { ...p, listing_availability: next } : p
        )
      );
      toast.success(
        next === "sold_out"
          ? "Listing marked sold out — hidden from search"
          : "Listing is Tolet again — visible in search"
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not update";
      toast.error(msg);
    } finally {
      setUpdatingAvailabilityId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Remove this listing permanently? This cannot be undone."
      )
    )
      return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("properties").delete().eq("id", id);

      if (error) throw error;
      setProperties(properties.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  /** This page only loads `properties` for `owner_id === user.id`, so the viewer owns every row. */
  const canSetAvailability = Boolean(user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Properties</h1>
              <p className="text-muted-foreground">
                {properties.length}{" "}
                {properties.length === 1 ? "property" : "properties"} listed
              </p>
              {canSetAvailability && properties.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                  Each card below has two areas:{" "}
                  <strong>Search &amp; availability</strong> (hide when rented)
                  and <strong>Manage this listing</strong> (view, edit, or remove).
                </p>
              )}
            </div>
            <Button asChild>
              <Link href="/dashboard/properties/new">
                <Plus className="w-4 h-4 mr-2" />
                Add New Property
              </Link>
            </Button>
          </div>

          {filteredProperties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Home className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-6">
                List your first property and start connecting with potential
                tenants and buyers
              </p>
              <Button asChild>
                <Link href="/dashboard/properties/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.map((property) => {
                const status =
                  statusConfig[property.status as keyof typeof statusConfig];
                const StatusIcon = status?.icon || Clock;
                const avail = property.listing_availability ?? "available";

                return (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 rounded-xl border bg-card shadow-sm"
                  >
                    <div className="relative w-full sm:w-52 h-40 sm:h-36 rounded-lg overflow-hidden shrink-0 border bg-muted/30">
                      <Image
                        src={
                          property.images?.[0] ||
                          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"
                        }
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                      <Badge
                        className={`absolute top-2 left-2 shadow-sm ${status?.className}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status?.label}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="min-w-0">
                        <Link
                          href={`/properties/${property.id}`}
                          className="text-lg font-semibold leading-snug hover:text-primary hover:underline underline-offset-2"
                        >
                          {property.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1.5">
                          {property.address}, {property.city}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="text-xl font-bold text-primary tabular-nums">
                          ₹
                          {property.price >= 100000
                            ? (property.price / 100000).toFixed(1) + "L"
                            : property.price.toLocaleString()}
                          {property.listing_type === "rent" && (
                            <span className="text-sm font-normal text-muted-foreground">
                              {" "}
                              /mo
                            </span>
                          )}
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {property.listing_type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4 shrink-0" aria-hidden />
                          <span>{property.contacts_count} contacts</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 shrink-0" aria-hidden />
                          <span>{property.favorites_count} saves</span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {canSetAvailability && (
                        <div className="rounded-lg border bg-muted/25 px-3 py-3 sm:px-4 sm:py-4">
                          <h3 className="text-sm font-semibold text-foreground">
                            Search &amp; availability
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Rented or sold? Tap below to hide this home from
                            search. Vacant again? Mark it available so buyers can
                            find it.
                          </p>
                          <div className="mt-3 flex flex-col gap-3">
                            <Badge
                              variant="outline"
                              className={`w-fit px-2.5 py-1 text-xs font-medium ${
                                avail === "sold_out"
                                  ? "border-muted-foreground/50 text-muted-foreground"
                                  : "border-emerald-600/50 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                              }`}
                            >
                              {avail === "sold_out"
                                ? "Hidden from search (sold out)"
                                : "Visible in search (Tolet)"}
                            </Badge>
                            <Button
                              type="button"
                              size="lg"
                              variant="secondary"
                              className="min-h-12 w-full sm:max-w-md justify-center font-medium"
                              disabled={updatingAvailabilityId === property.id}
                              onClick={() =>
                                setListingAvailability(
                                  property,
                                  avail === "sold_out"
                                    ? "available"
                                    : "sold_out"
                                )
                              }
                            >
                              {updatingAvailabilityId === property.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Updating…
                                </>
                              ) : avail === "sold_out" ? (
                                "Show in search again (Tolet)"
                              ) : (
                                "Hide from search (sold / rented)"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-foreground mb-2">
                          Manage this listing
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Open your public page, change details, or remove this
                          listing.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <Button
                            size="lg"
                            className="min-h-12 w-full justify-center gap-2 font-medium"
                            asChild
                          >
                            <Link
                              href={`/properties/${property.id}`}
                              className="inline-flex items-center justify-center"
                            >
                              <Eye className="w-5 h-5 shrink-0" />
                              View public page
                            </Link>
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="min-h-12 w-full justify-center gap-2 font-medium border-2"
                            asChild
                          >
                            <Link
                              href={`/dashboard/properties/${property.id}/edit`}
                              className="inline-flex items-center justify-center"
                            >
                              <Edit className="w-5 h-5 shrink-0" />
                              Edit details
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            className="min-h-12 w-full justify-center gap-2 font-medium border-2 border-destructive/35 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(property.id)}
                          >
                            <Trash2 className="w-5 h-5 shrink-0" />
                            Remove listing
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
