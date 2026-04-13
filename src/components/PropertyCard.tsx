"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/types";
import { normalizeNearbyPlaces } from "@/lib/types";
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  IndianRupee,
  BadgeCheck,
  Eye,
  ChevronRight,
  Crown,
  MapPinned,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  variant?: "grid" | "list";
}

const defaultImages = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
];

function formatPrice(price: number, listingType: string) {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `${(price / 100000).toFixed(2)} L`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(1)}K`;
  }
  return price.toString();
}

function getPriceLabel(listingType: string) {
  switch (listingType) {
    case "rent":
      return "/month";
    case "lease":
      return "/year";
    default:
      return "";
  }
}

function getUpdatedAt(property: Property) {
  const date = property.updated_at || property.created_at;
  if (!date) return null;
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: false }) + " ago";
  } catch {
    return null;
  }
}

export function PropertyCard({
  property,
  onFavorite,
  isFavorite,
  isSelected,
  onClick,
  variant = "grid",
}: PropertyCardProps & { isSelected?: boolean; onClick?: () => void }) {
  const images = property.images?.length
    ? property.images
    : [defaultImages[Math.floor(Math.random() * defaultImages.length)]];
  const imageUrl = images[0];
  const imageCount = images.length;
  const ownerName =
    (property.owner as { full_name?: string } | undefined)?.full_name ||
    "Owner";
  const updatedStr = getUpdatedAt(property);
  const nearbyLabels = normalizeNearbyPlaces(property.nearby_places);
  const nearbyPreview = nearbyLabels.slice(0, 4);
  const nearbyExtra =
    nearbyLabels.length > nearbyPreview.length
      ? nearbyLabels.length - nearbyPreview.length
      : 0;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(property.id);
  };

  // ——— List variant: horizontal card (reference design) ———
  if (variant === "list") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col sm:flex-row min-h-[200px]">
          {/* Left: Image */}
          <Link
            href={`/properties/${property.id}`}
            className="relative w-full sm:w-72 sm:min-w-[280px] aspect-[4/3] sm:aspect-auto sm:h-[220px] flex-shrink-0"
          >
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            {/* Top left: Owner */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center text-xs font-semibold text-primary-foreground">
                {ownerName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-white drop-shadow-sm">
                {ownerName}
              </span>
            </div>
            {/* Top right: Locality Champion (optional – use is_featured) */}
            {property.is_featured && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-zinc-800/90 text-white backdrop-blur gap-1 border-0">
                  <Crown className="w-3.5 h-3.5" />
                  Featured
                </Badge>
              </div>
            )}
            {/* Bottom left: Verified */}
            {property.is_verified && (
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-primary/95 text-primary-foreground backdrop-blur gap-1 border-0">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </Badge>
              </div>
            )}
            {/* Bottom right: Image count + arrow */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-white/90 text-sm bg-black/30 backdrop-blur rounded-full px-2.5 py-1">
              <span>1/{imageCount}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Right: Details */}
          <div className="flex-1 flex flex-col p-4 sm:p-5 min-w-0">
            <Link href={`/properties/${property.id}`}>
              <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                {property.title}
              </h3>
            </Link>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                ₹{formatPrice(property.price, property.listing_type)}
              </span>
              <span className="text-muted-foreground text-sm">
                {getPriceLabel(property.listing_type)}
              </span>
            </div>
            <Link
              href={`/properties/${property.id}#details`}
              className="text-xs text-muted-foreground border-b border-dashed border-muted-foreground/40 hover:border-primary inline-flex w-fit mb-3"
            >
              see price breakup
            </Link>

            {/* Key features row */}
            <div className="flex flex-wrap gap-4 py-3 border-y border-border/60">
              {property.area_sqft != null && (
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {property.area_sqft} sq.ft
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Builtup area
                  </div>
                </div>
              )}
              {property.furnishing && (
                <div>
                  <div className="text-sm font-semibold text-foreground capitalize">
                    {property.furnishing.replace("-", " ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Furnishing
                  </div>
                </div>
              )}
              {(property.bedrooms != null || property.bathrooms != null) && (
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {[
                      property.bedrooms != null && `${property.bedrooms} BHK`,
                      property.bathrooms != null &&
                        `${property.bathrooms} Bath`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Configuration
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-1 gap-y-0.5 mt-2">
                {property.amenities.slice(0, 5).map((a, i) => (
                  <span key={i}>
                    {i > 0 && " • "}
                    {a}
                  </span>
                ))}
              </div>
            )}

            {nearbyPreview.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5">
                <MapPinned className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>
                  {nearbyPreview.join(" · ")}
                  {nearbyExtra > 0 ? ` +${nearbyExtra}` : ""}
                </span>
              </div>
            )}

            <div className="mt-auto pt-4 flex items-center justify-between gap-2">
              {updatedStr && (
                <span className="text-xs text-muted-foreground">
                  Updated {updatedStr}
                </span>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {onFavorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full border"
                    onClick={handleFavoriteClick}
                  >
                    <Heart
                      className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                    />
                  </Button>
                )}
                <Button
                  asChild
                  size="sm"
                  className="rounded-lg bg-primary hover:bg-primary/90"
                >
                  <Link href={`/properties/${property.id}`}>Contact</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  // ——— Grid variant: modern card ———
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`group relative bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        isSelected ? "ring-2 ring-primary border-primary shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <Link href={`/properties/${property.id}`}>
        <div className="relative h-56 overflow-hidden">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge className="bg-black/55 text-white border-0 backdrop-blur px-2 py-0.5">
              {property.listing_type === "sale"
                ? "For Sale"
                : property.listing_type === "rent"
                  ? "For Rent"
                  : "For Lease"}
            </Badge>
            {property.is_verified && (
              <Badge className="bg-primary/95 text-primary-foreground border-0 backdrop-blur gap-1 px-2 py-0.5">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified
              </Badge>
            )}
          </div>

          {onFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur hover:bg-white shadow-sm"
              onClick={handleFavoriteClick}
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-zinc-600"}`}
              />
            </Button>
          )}

          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-1.5 text-white/90 text-sm">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {property.locality || property.city}, {property.state}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4 sm:p-5">
        <Link href={`/properties/${property.id}`}>
          <h3 className="font-semibold text-[15px] sm:text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-xs text-muted-foreground">Price</span>
          <span className="ml-auto text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            ₹{formatPrice(property.price, property.listing_type)}
          </span>
          {getPriceLabel(property.listing_type) && (
            <span className="text-muted-foreground text-xs sm:text-sm">
              {getPriceLabel(property.listing_type)}
            </span>
          )}
          {property.price_negotiable && (
            <Badge variant="secondary" className="ml-2 text-[11px] font-normal">
              Negotiable
            </Badge>
          )}
        </div>

        {nearbyPreview.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs mb-3">
            <MapPinned className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span className="line-clamp-2">
              Nearby: {nearbyPreview.join(" · ")}
              {nearbyExtra > 0 ? ` +${nearbyExtra}` : ""}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 text-muted-foreground text-sm mb-4">
          {property.bedrooms != null && (
            <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1">
              <BedDouble className="w-4 h-4" />
              <span className="text-xs sm:text-sm">
                {property.bedrooms} Beds
              </span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1">
              <Bath className="w-4 h-4" />
              <span className="text-xs sm:text-sm">
                {property.bathrooms} Baths
              </span>
            </div>
          )}
          {property.area_sqft != null && (
            <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1">
              <Maximize className="w-4 h-4" />
              <span className="text-xs sm:text-sm">
                {property.area_sqft} sqft
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="capitalize">{property.property_type}</span>
            {property.furnishing && (
              <>
                <span className="text-border">·</span>
                <span className="capitalize">
                  {property.furnishing.replace("-", " ")}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{property.views_count}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
