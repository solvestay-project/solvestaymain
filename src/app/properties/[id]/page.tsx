"use client";

import { useState, useEffect, useRef, use, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import type { Property } from "@/lib/types";
import { normalizeNearbyPlaces } from "@/lib/types";
import { toast } from "sonner";
import { VisitScheduler } from "@/components/VisitScheduler";
import { PropertyReportSection } from "@/components/PropertyReportSection";
import { Panorama360Viewer } from "@/components/Panorama360Viewer";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  Heart,
  Share2,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  IndianRupee,
  BadgeCheck,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Compass,
  Clock,
  Layers,
  Sofa,
  Star,
  ArrowLeft,
  Loader2,
  Lock,
  Check,
  Car,
  Dumbbell,
  Waves,
  TreePine,
  Shield,
  ArrowUpDown,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Video,
  Gamepad2,
  Shirt,
  ShoppingBag,
  HeartPulse,
  Sun,
  CloudRain,
  Package,
  Baby,
  Footprints,
  CircleDollarSign,
  Banknote,
  MapPinned,
  Wrench,
  History,
  Percent,
  FileText,
  type LucideIcon,
} from "lucide-react";

const AMENITY_ICONS: Record<string, typeof Check> = {
  Parking: Car,
  "Visitor Parking": Car,
  Gym: Dumbbell,
  "Swimming Pool": Waves,
  Garden: TreePine,
  Security: Shield,
  Lift: ArrowUpDown,
  "Power Backup": Zap,
  "Water Supply": Droplets,
  "Gas Pipeline": Flame,
  "Club House": Building2,
  "Children Play Area": Baby,
  "Fire Safety": Flame,
  Intercom: Phone,
  "Rain Water Harvesting": CloudRain,
  "Servant Room": Package,
  "Store Room": Package,
  Balcony: Sun,
  Terrace: Sun,
  AC: Building2,
  WiFi: Wifi,
  CCTV: Video,
  "Gated Community": Lock,
  "Jogging Track": Footprints,
  "Indoor Games": Gamepad2,
  "Party Hall": Building2,
  Laundry: Shirt,
  ATM: CircleDollarSign,
  "Grocery Store": ShoppingBag,
  "Medical Shop": HeartPulse,
};

function getAmenityIcon(amenity: string) {
  return AMENITY_ICONS[amenity] ?? Check;
}

function OverviewRow({
  icon: Icon,
  label,
  value,
  extra,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center self-start">
        <Icon className="w-4 h-4 text-primary" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
        {extra}
      </div>
    </div>
  );
}

/** Cycle tile shapes so the gallery reads as masonry while columns stay balanced. */
const GALLERY_TILE_ASPECTS = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[5/4]",
  "aspect-[4/3]",
  "aspect-[2/3]",
] as const;

const sampleProperty: Property = {
  id: "1",
  owner_id: "1",
  title: "Luxury 3 BHK Apartment in Bandra West",
  description: `Experience luxury living in this stunning 3 BHK apartment located in the heart of Bandra West. This meticulously designed home offers breathtaking sea views and world-class amenities.

The apartment features spacious rooms with high ceilings, premium Italian marble flooring, and large windows that flood the space with natural light. The modular kitchen is equipped with top-of-the-line appliances and ample storage space.

Building amenities include a state-of-the-art gym, infinity swimming pool, landscaped gardens, children's play area, and 24/7 security. The location offers easy access to restaurants, cafes, shopping centers, and excellent connectivity to the rest of Mumbai.

Perfect for families looking for a premium lifestyle in one of Mumbai's most sought-after neighborhoods.`,
  property_type: "apartment",
  listing_type: "rent",
  price: 85000,
  price_negotiable: true,
  area_sqft: 1450,
  bedrooms: 3,
  bathrooms: 2,
  furnishing: "fully-furnished",
  floor_number: 12,
  total_floors: 20,
  facing: "West",
  age_of_property: 5,
  address: "Bandra West, Near Bandstand",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400050",
  latitude: 19.0596,
  longitude: 72.8295,
  amenities: [
    "Parking",
    "Gym",
    "Swimming Pool",
    "Security",
    "Lift",
    "Power Backup",
    "Club House",
    "Garden",
    "Intercom",
  ],
  nearby_places: ["Metro / Railway", "School", "Hospital", "Mall"],
  images: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200",
  ],
  video_url: null,
  virtual_tour_url: null,
  images_360: [],
  is_verified: true,
  is_active: true,
  views_count: 234,
  contacts_count: 12,
  status: "approved",
  listing_availability: "available",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  owner: {
    id: "1",
    email: "owner@example.com",
    full_name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    role: "owner",
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, subscription } = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [hasRevealedContact, setHasRevealedContact] = useState(false);
  const [contactInfo, setContactInfo] = useState<{
    phone?: string;
    email?: string;
    whatsapp?: string;
    name?: string;
  } | null>(null);
  const [show360Viewer, setShow360Viewer] = useState(false);
  const [current360Index, setCurrent360Index] = useState(0);
  const ownerApiMergedForId = useRef<string | null>(null);

  useEffect(() => {
    ownerApiMergedForId.current = null;
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchProperty();
  }, [resolvedParams.id]);

  /** Owners reading their own listing: merge full row from owner API (service role) so nearby_places and other fields are complete. */
  useEffect(() => {
    if (!user?.id || !property?.id) return;
    if (property.owner_id !== user.id) return;
    if (ownerApiMergedForId.current === property.id) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/properties/${property.id}`, {
          credentials: "include",
        });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const p = json.property as Property | undefined;
        if (!p || cancelled) return;
        setProperty((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...p,
            nearby_places: normalizeNearbyPlaces(p.nearby_places),
            owner: prev.owner ?? p.owner,
          };
        });
        ownerApiMergedForId.current = property.id;
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, property?.id, property?.owner_id]);

  useEffect(() => {
    if (user && property) {
      checkContactReveal();
      if (user.role !== "owner") {
        checkFavoriteStatus();
      }
    }
  }, [user, property]);

  const checkContactReveal = async () => {
    if (!user || !property) return;

    try {
      const response = await fetch(
        `/api/contacts/reveal?property_id=${property.id}`
      );
      const data = await response.json();

      if (response.ok && data.is_revealed && data.contact) {
        setHasRevealedContact(true);
        setContactInfo(data.contact);
      }
    } catch (error) {
      console.error("Error checking contact reveal:", error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !property) return;

    try {
      const response = await fetch(`/api/favorites?property_id=${property.id}`);
      const data = await response.json();

      if (response.ok) {
        setIsFavorite(data.is_favorite || false);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const fetchProperty = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*, owner:profiles(*)")
        .eq("id", resolvedParams.id)
        .single();

      if (error) throw error;
      if (data) {
        // Ensure images_360 is an array (handle null/undefined)
        let images360: string[] = [];
        if (data.images_360) {
          if (Array.isArray(data.images_360)) {
            images360 = data.images_360.filter(
              (img: any) => img && String(img).trim() !== ""
            );
          } else if (typeof data.images_360 === "string") {
            // Handle string that might be JSON
            try {
              const parsed = JSON.parse(data.images_360);
              images360 = Array.isArray(parsed)
                ? parsed.filter((img: any) => img && String(img).trim() !== "")
                : [];
            } catch {
              images360 = [data.images_360].filter(
                (img: any) => img && String(img).trim() !== ""
              );
            }
          }
        }

        const propertyData = {
          ...data,
          images_360: images360,
          nearby_places: normalizeNearbyPlaces(
            (data as { nearby_places?: unknown }).nearby_places
          ),
        };
        setProperty(propertyData as Property);

        // Debug logging
        console.log("🏠 Property loaded:", {
          id: propertyData.id,
          title: propertyData.title,
          images_count: propertyData.images?.length || 0,
          images_360_count: images360.length,
          images_360: images360,
        });
      } else {
        setProperty({ ...sampleProperty, id: resolvedParams.id });
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      setProperty({ ...sampleProperty, id: resolvedParams.id });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, listingType: string) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(2)} L`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}K`;
    }
    return price.toString();
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      router.push("/auth/login");
      return;
    }

    if (!property) return;

    if (
      property.listing_availability === "sold_out" &&
      user?.id !== property.owner_id
    ) {
      toast.error("This listing is no longer available");
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(
          `/api/favorites?property_id=${property.id}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to remove favorite");
        }

        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ property_id: property.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to add favorite");
        }

        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      console.error("Favorite error:", error);
      toast.error(error.message || "Failed to update favorite");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleRevealContact = async () => {
    if (!user) {
      toast.error("Please sign in to view contact details");
      router.push("/auth/login");
      return;
    }

    if (
      property?.listing_availability === "sold_out" &&
      user.id !== property.owner_id
    ) {
      toast.error("This listing is no longer available");
      return;
    }

    try {
      const response = await fetch("/api/contacts/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: resolvedParams.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setShowContactModal(true);
          return;
        }
        throw new Error(data.error || "Failed to reveal contact");
      }

      setHasRevealedContact(true);
      if (data.contact) {
        setContactInfo(data.contact);
      }
      toast.success("Contact details revealed!");
      // Refresh user data to update contact limits if needed
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Property not found</h2>
          <p className="text-muted-foreground mb-4">
            The property you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hideBuyerSidebar = user?.role === "owner";
  const hideSaveFavorite = user?.role === "owner";
  const isSoldOut = property.listing_availability === "sold_out";
  const isListingOwner = user?.id === property.owner_id;
  /** Customers (and non-owners) cannot contact or save when the owner marked the unit sold/rented */
  const blockPublicBuyer = isSoldOut && !isListingOwner;
  const images = property.images || sampleProperty.images;
  const nearbyList = normalizeNearbyPlaces(property.nearby_places);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to listings
          </Button>

          {isSoldOut && (
            <div
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
              role="status"
            >
              {isListingOwner ? (
                <p>
                  This listing is marked <strong>sold out</strong> and is hidden
                  from public search. Use <strong>My Properties</strong> to mark
                  it <strong>Tolet</strong> when it is vacant again.
                </p>
              ) : (
                <p>
                  This property is <strong>no longer available</strong>. It may
                  have been rented or sold.
                </p>
              )}
            </div>
          )}

          {/* Image gallery: responsive masonry — click any to open modal */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {images?.length ?? 0} photo{images?.length === 1 ? "" : "s"}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-9"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Share
                </Button>
                {!hideSaveFavorite && !blockPublicBuyer && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-9"
                    onClick={handleFavorite}
                  >
                    <Heart
                      className={`w-4 h-4 mr-1.5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                    />
                    Save
                  </Button>
                )}
              </div>
            </div>
            <ResponsiveMasonry
              columnsCountBreakPoints={{ 350: 2, 640: 3, 1024: 4 }}
              gutterBreakPoints={{ 350: "8px", 640: "12px", 1024: "12px" }}
            >
              <Masonry sequential>
                {(images ?? []).map((src, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`relative w-full overflow-hidden rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${GALLERY_TILE_ASPECTS[index % GALLERY_TILE_ASPECTS.length]}`}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setIsGalleryOpen(true);
                    }}
                  >
                    <Image
                      src={src}
                      alt={`${property.title} - ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/50 backdrop-blur px-2 py-0.5 text-xs font-medium text-white">
                        Cover
                      </span>
                    )}
                  </button>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          </div>

          <div
            className={`grid gap-8 ${hideBuyerSidebar ? "" : "lg:grid-cols-3"}`}
          >
            <div
              className={`space-y-8 ${hideBuyerSidebar ? "" : "lg:col-span-2"}`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className="bg-primary/90">
                    {property.listing_type === "sale"
                      ? "For Sale"
                      : property.listing_type === "rent"
                        ? "For Rent"
                        : "For Lease"}
                  </Badge>
                  {isSoldOut && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Sold out
                    </Badge>
                  )}
                  {property.is_verified && (
                    <Badge
                      variant="secondary"
                      className="bg-green-500/90 text-white"
                    >
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <span className="capitalize text-muted-foreground">
                    {property.property_type}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  {property.title}
                </h1>

                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <MapPin className="w-5 h-5" />
                  <span>
                    {property.address}, {property.city}, {property.state} -{" "}
                    {property.pincode}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-6">
                  <IndianRupee className="w-8 h-8 text-primary" />
                  <span className="text-4xl font-bold text-primary">
                    {formatPrice(property.price, property.listing_type)}
                  </span>
                  <span className="text-muted-foreground text-xl">
                    {property.listing_type === "rent"
                      ? "/month"
                      : property.listing_type === "lease"
                        ? "/year"
                        : ""}
                  </span>
                  {property.price_negotiable && (
                    <Badge variant="outline" className="ml-2">
                      Negotiable
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-6 p-6 bg-muted/50 rounded-xl">
                  {property.bedrooms && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BedDouble className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {property.bedrooms} Bedrooms
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Spacious rooms
                        </div>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bath className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {property.bathrooms} Bathrooms
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Attached baths
                        </div>
                      </div>
                    </div>
                  )}
                  {property.area_sqft && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Maximize className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {property.area_sqft} sqft
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Super built-up
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">About this property</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Overview — two-column key-value layout */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div className="space-y-5">
                    {property.security_deposit != null && (
                      <OverviewRow
                        icon={Banknote}
                        label="Security"
                        value={
                          property.security_deposit >= 100000
                            ? `₹${(property.security_deposit / 100000).toFixed(1)} Lac`
                            : `₹${property.security_deposit.toLocaleString("en-IN")}`
                        }
                      />
                    )}
                    {property.maintenance_charge != null && (
                      <OverviewRow
                        icon={Wrench}
                        label="Maintenance"
                        value={`₹${property.maintenance_charge.toLocaleString("en-IN")}`}
                      />
                    )}
                    {property.furnishing && (
                      <OverviewRow
                        icon={Sofa}
                        label="Furnishing"
                        value={
                          <span className="capitalize">
                            {property.furnishing.replace("-", " ")}
                          </span>
                        }
                      />
                    )}
                    {property.balconies != null && (
                      <OverviewRow icon={Sun} label="Balcony" value={property.balconies} />
                    )}
                    {(property.floor_number != null || property.total_floors != null) && (
                      <OverviewRow
                        icon={Layers}
                        label="Floor number"
                        value={
                          property.floor_number != null && property.total_floors != null
                            ? `${property.floor_number} of ${property.total_floors} floors`
                            : property.floor_number != null
                              ? `Floor ${property.floor_number}`
                              : `${property.total_floors} floors`
                        }
                      />
                    )}
                    {property.age_of_property != null && (
                      <OverviewRow
                        icon={History}
                        label="Age of property"
                        value={`${property.age_of_property} year${property.age_of_property !== 1 ? "s" : ""}`}
                      />
                    )}
                  </div>
                  <div className="space-y-5">
                    <OverviewRow
                      icon={Percent}
                      label="Brokerage"
                      value="₹0"
                      extra={
                        <Link
                          href="/properties"
                          className="text-sm text-primary font-medium mt-0.5 inline-flex items-center gap-1 hover:underline"
                        >
                          Access Zero Brokerage Properties
                          <span className="text-primary">›</span>
                        </Link>
                      }
                    />
                    {property.area_sqft != null && (
                      <OverviewRow
                        icon={Maximize}
                        label="Built up area"
                        value={`${property.area_sqft.toLocaleString("en-IN")} sq.ft`}
                      />
                    )}
                    {property.bathrooms != null && (
                      <OverviewRow icon={Bath} label="Bathrooms" value={property.bathrooms} />
                    )}
                    <OverviewRow
                      icon={Calendar}
                      label="Available from"
                      value={
                        property.available_from
                          ? new Date(property.available_from).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })
                          : property.possession_status === "ready"
                            ? "Available now"
                            : property.possession_status === "under_construction"
                              ? "Under construction"
                              : "—"
                      }
                    />
                    <OverviewRow
                      icon={FileText}
                      label="Lease type"
                      value={
                        property.listing_type === "rent"
                          ? "Family / Bachelor / Company"
                          : property.listing_type === "lease"
                            ? "Long term lease"
                            : "—"
                      }
                    />
                    <OverviewRow
                      icon={Car}
                      label="Parking"
                      value={
                        property.amenities?.find((a) =>
                          a.toLowerCase().includes("parking")
                        ) ?? "—"
                      }
                    />
                  </div>
                </div>
              </div>

              {property.images_360 && property.images_360.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Compass className="w-6 h-6 text-primary" />
                    360° Virtual Tour
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click on any image below to experience an immersive 360°
                    view
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.images_360.map((image, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("🖱️ Opening 360° viewer:", {
                            index,
                            image,
                          });
                          setCurrent360Index(index);
                          setShow360Viewer(true);
                        }}
                      >
                        <img
                          src={image}
                          alt={`360° View ${index + 1}`}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.error(
                              "❌ Failed to load 360° thumbnail:",
                              image
                            );
                            e.currentTarget.src = "/placeholder-360.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 text-white font-medium">
                            <Compass className="w-5 h-5" />
                            <span>Click to view 360°</span>
                          </div>
                        </div>
                        <Badge className="absolute top-4 left-4 bg-primary/90 text-white border-0">
                          360°
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Debug: Show if images_360 exists but is empty
                process.env.NODE_ENV === "development" && (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                    <p>
                      Debug: images_360 = {JSON.stringify(property.images_360)}
                    </p>
                    <p>Type: {typeof property.images_360}</p>
                    <p>
                      Is Array:{" "}
                      {Array.isArray(property.images_360) ? "Yes" : "No"}
                    </p>
                    <p>
                      Length:{" "}
                      {Array.isArray(property.images_360)
                        ? property.images_360.length
                        : "N/A"}
                    </p>
                  </div>
                )
              )}

              <div>
                <h2 className="text-2xl font-bold mb-4">Property Details</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {property.property_type && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Property Type
                        </div>
                        <div className="font-medium capitalize">
                          {property.property_type}
                        </div>
                      </div>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border">
                      <Sofa className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Furnishing
                        </div>
                        <div className="font-medium capitalize">
                          {property.furnishing.replace("-", " ")}
                        </div>
                      </div>
                    </div>
                  )}
                  {property.floor_number && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border">
                      <Layers className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Floor
                        </div>
                        <div className="font-medium">
                          {property.floor_number} of {property.total_floors}
                        </div>
                      </div>
                    </div>
                  )}
                  {property.facing && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border">
                      <Compass className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Facing
                        </div>
                        <div className="font-medium">{property.facing}</div>
                      </div>
                    </div>
                  )}
                  {property.age_of_property && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Age of Property
                        </div>
                        <div className="font-medium">
                          {property.age_of_property} years
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {property.amenities.map((amenity) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 p-3 rounded-xl border bg-card"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(nearbyList.length > 0 ||
                (hideBuyerSidebar &&
                  user?.id === property.owner_id)) && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <MapPinned className="w-7 h-7 text-primary shrink-0" />
                    Nearby
                  </h2>
                  {nearbyList.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Places and landmarks around this property (as shared by
                        the owner).
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {nearbyList.map((place) => (
                          <span
                            key={place}
                            className="inline-flex items-center rounded-full border bg-muted/40 px-3 py-1.5 text-sm font-medium"
                          >
                            {place}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven&apos;t added nearby places yet.{" "}
                      <Link
                        href={`/dashboard/properties/${property.id}/edit`}
                        className="text-primary font-medium hover:underline"
                      >
                        Edit listing
                      </Link>{" "}
                      to add landmarks (metro, schools, etc.).
                    </p>
                  )}
                </div>
              )}

              {!hideBuyerSidebar && !blockPublicBuyer && (
                <PropertyReportSection
                  propertyId={property.id}
                  propertyTitle={property.title}
                />
              )}
            </div>

            {!hideBuyerSidebar && !blockPublicBuyer && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky top-24 space-y-6"
                >
                  <div className="p-6 rounded-2xl border bg-card">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={property.owner?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {property.owner?.full_name?.charAt(0) || "O"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-lg">
                          {property.owner?.full_name || "Property Owner"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {property.owner?.is_verified && (
                            <>
                              <BadgeCheck className="w-4 h-4 text-green-500" />
                              <span>Verified Owner</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {hasRevealedContact && contactInfo ? (
                      <div className="space-y-3 mb-6 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                          Contact Information
                        </h4>
                        {contactInfo.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-green-600" />
                            <a
                              href={`tel:${contactInfo.phone}`}
                              className="font-medium text-green-900 dark:text-green-100 hover:underline"
                            >
                              {contactInfo.phone}
                            </a>
                          </div>
                        )}
                        {contactInfo.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-green-600" />
                            <a
                              href={`mailto:${contactInfo.email}`}
                              className="font-medium text-green-900 dark:text-green-100 hover:underline"
                            >
                              {contactInfo.email}
                            </a>
                          </div>
                        )}
                        {contactInfo.whatsapp && (
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            <a
                              href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-green-900 dark:text-green-100 hover:underline"
                            >
                              {contactInfo.whatsapp}
                            </a>
                          </div>
                        )}
                        <div className="text-sm text-green-700 dark:text-green-400">
                          Contact revealed! You can now contact the owner
                          directly.
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full h-12 mb-4"
                        onClick={handleRevealContact}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Reveal Contact Number
                      </Button>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-12"
                        onClick={handleFavorite}
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                        />
                        {isFavorite ? "Saved" : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  <VisitScheduler
                    propertyId={property.id}
                    ownerId={property.owner_id}
                  />

                  <div className="p-6 rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/5">
                    <h3 className="font-semibold mb-4">
                      Need help finding a property?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our experts can help you find the perfect property matching
                      your requirements.
                    </p>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Get Expert Help
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Almost full-width modal with modern full-width carousel */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[92vw] sm:w-[92vw] p-0 gap-0 overflow-hidden rounded-2xl border-0 bg-black shadow-2xl">
          <div className="relative w-full aspect-video max-h-[60vh] bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-30 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-white/20 backdrop-blur"
              onClick={() => setIsGalleryOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Modern carousel: full-width sliding track */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="flex h-full"
                style={{ width: `${(images?.length ?? 1) * 100}%` }}
                animate={{
                  x: `-${currentImageIndex * (100 / (images?.length ?? 1))}%`,
                }}
                transition={{ type: "tween", duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              >
                {images?.map((src, index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 h-full min-w-0"
                    style={{ width: `${100 / (images?.length ?? 1)}%` }}
                  >
                    <Image
                      src={src}
                      alt={`${property.title} - ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="95vw"
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Prev / Next — modern pill buttons */}
            {(images?.length ?? 0) > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-black/50 text-white hover:bg-white/20 backdrop-blur border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? (images?.length ?? 1) - 1 : prev - 1
                    );
                  }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-black/50 text-white hover:bg-white/20 backdrop-blur border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) =>
                      prev === (images?.length ?? 1) - 1 ? 0 : prev + 1
                    );
                  }}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Bottom bar: counter + dots */}
            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
              <span className="text-sm text-white/90 font-medium">
                {currentImageIndex + 1} / {images?.length ?? 0}
              </span>
              <div className="flex gap-1.5">
                {images?.map((_, index) => (
                  <button
                    key={index}
                    className={`rounded-full transition-all duration-200 ${
                      index === currentImageIndex
                        ? "h-2 w-6 bg-white"
                        : "h-2 w-2 bg-white/50 hover:bg-white/70"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to Contact Owners</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mb-6">
            Get a subscription to unlock contact details and connect directly
            with property owners.
          </p>
          <div className="space-y-3">
            <Link href="/pricing" className="block">
              <Button className="w-full">View Subscription Plans</Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowContactModal(false)}
            >
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />

      {/* 360 Viewer Modal */}
      {property.images_360 && property.images_360.length > 0 && (
        <Panorama360Viewer
          images={property.images_360}
          isOpen={show360Viewer}
          onClose={() => setShow360Viewer(false)}
          initialIndex={current360Index}
        />
      )}
    </div>
  );
}
