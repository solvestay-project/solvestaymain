"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import type {
  Property,
  PropertyType,
  ListingType,
  FurnishingType,
} from "@/lib/types";
import { AMENITIES } from "@/lib/types";
import { HomeCitySelect } from "@/components/HomeCitySelect";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  MapPin,
  X,
  Loader2,
  Home,
  Building2,
  Users,
  LandPlot,
  Castle,
  Store,
  Map as MapIcon,
} from "lucide-react";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(
  () => import("@/components/PropertyMap").then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted animate-pulse rounded-xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    ),
  },
);

const propertyTypeIcons = {
  house: Home,
  apartment: Building2,
  pg: Users,
  land: LandPlot,
  villa: Castle,
  commercial: Store,
};

function parseListingTypeParam(v: string | null): ListingType | "" {
  if (v === "sale" || v === "rent" || v === "lease") return v;
  return "";
}

function PropertiesContent() {
  // Nearby toggle for subscribers (customers)
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(5); // km
  const hasActiveSubscription = useAuthStore((s: any) =>
    s.hasActiveSubscription(),
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") || "",
  );
  const [areaOptions, setAreaOptions] = useState<
    { id: string; text: string }[]
  >([]);
  const [areaSearching, setAreaSearching] = useState(false);
  const defaultSearchCity = "Bangalore";
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    20.5937, 78.9629,
  ]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<PropertyType | "">(
    (searchParams.get("property_type") as PropertyType) || "",
  );
  const [selectedListing, setSelectedListing] = useState<ListingType | "">(() =>
    parseListingTypeParam(searchParams.get("listing_type")),
  );
  const lastUrlQueryKey = useRef<string | null>(null);
  const [selectedFurnishing, setSelectedFurnishing] = useState<
    FurnishingType | ""
  >("");
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showMap, setShowMap] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const fetchAreaSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setAreaOptions([]);
        return;
      }
      const cityForSearch = selectedCity || defaultSearchCity;
      try {
        const res = await fetch(
          `/api/place?q=${encodeURIComponent(query + ", " + cityForSearch)}&limit=6`,
        );
        const data = await res.json();
        const places = data.success && data.places ? data.places : [];
        setAreaOptions(
          places.map((p: any, i: number) => ({
            id: `${p.display_name}-${i}`,
            text: p.area || p.display_name || "",
          })),
        );
      } catch {
        setAreaOptions([]);
      }
    },
    [selectedCity],
  );

  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

  useEffect(() => {
    if (!selectedArea.trim()) {
      setAreaOptions([]);
      setShowAreaSuggestions(false);
      return;
    }
    const t = setTimeout(() => {
      setAreaSearching(true);
      fetchAreaSuggestions(selectedArea).finally(() => setAreaSearching(false));
    }, 200);
    return () => clearTimeout(t);
  }, [selectedArea, selectedCity, fetchAreaSuggestions]);

  useEffect(() => {
    if (areaOptions.length > 0) setShowAreaSuggestions(true);
  }, [areaOptions.length]);

  useEffect(() => {
    const key = searchParams.toString();
    const urlChanged =
      lastUrlQueryKey.current === null || key !== lastUrlQueryKey.current;
    if (urlChanged) {
      lastUrlQueryKey.current = key;
      const city = searchParams.get("city") || "";
      const area = searchParams.get("area") || "";
      const pt = (searchParams.get("property_type") as PropertyType) || "";
      const lt = parseListingTypeParam(searchParams.get("listing_type"));
      setSelectedCity(city);
      setSelectedArea(area);
      setSelectedType(pt);
      setSelectedListing(lt);
      void fetchProperties({
        city,
        area,
        propertyType: pt,
        listingType: lt,
      });
      return;
    }
    void fetchProperties();
  }, [searchParams, sortBy]);

  // Get user live location on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true },
      );
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== "owner") {
      fetchFavoriteIds();
    }
  }, [user, properties]);

  const fetchProperties = async (
    overrides?: {
      city?: string;
      area?: string;
      propertyType?: PropertyType | "";
      listingType?: ListingType | "";
    },
  ) => {
    setIsLoading(true);
    try {
      const city =
        overrides?.city !== undefined ? overrides.city : selectedCity;
      const area =
        overrides?.area !== undefined ? overrides.area : selectedArea;
      const propType =
        overrides?.propertyType !== undefined
          ? overrides.propertyType
          : selectedType;
      const listingType =
        overrides?.listingType !== undefined
          ? overrides.listingType
          : selectedListing;

      const supabase = createClient();
      let query = supabase
        .from("properties")
        .select("*, owner:profiles(id, full_name, avatar_url)")
        .eq("status", "approved")
        .eq("is_active", true);

      if (city) {
        query = query.ilike("city", `%${city}%`);
      }
      if (area) {
        query = query.ilike("address", `%${area}%`);
      }
      if (propType) {
        query = query.eq("property_type", propType);
      }
      if (listingType) {
        query = query.eq("listing_type", listingType);
      }

      if (sortBy === "price_low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price_high") {
        query = query.order("price", { ascending: false });
      } else if (sortBy === "popular") {
        query = query.order("views_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      const visible = (data || []).filter(
        (row: Property & { listing_availability?: string }) =>
          row.listing_availability !== "sold_out",
      );
      if (visible.length > 0) {
        setProperties(visible);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavoriteIds = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/favorites");
      const data = await response.json();

      if (response.ok && data.favorites) {
        const ids = new Set<string>(
          data.favorites.map((f: any) => f.property_id),
        );
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleFavorite = async (propertyId: string) => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      router.push("/auth/login");
      return;
    }

    try {
      const isFavorite = favoriteIds.has(propertyId);

      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(
          `/api/favorites?property_id=${propertyId}`,
          {
            method: "DELETE",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to remove favorite");
        }

        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ property_id: propertyId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to add favorite");
        }

        setFavoriteIds((prev) => new Set(prev).add(propertyId));
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      console.error("Favorite error:", error);
      toast.error(error.message || "Failed to update favorite");
    }
  };

  const clearFilters = () => {
    setSelectedCity("");
    setSelectedArea("");
    setSelectedType("");
    setSelectedFurnishing("");
    setPriceRange([0, 50000000]);
    setSelectedAmenities([]);
    router.push("/properties");
    void fetchProperties({
      city: "",
      area: "",
      propertyType: "",
      listingType: "",
    });
  };

  const applySearch = () => {
    void fetchProperties();
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (selectedType) params.set("property_type", selectedType);
    if (selectedListing) params.set("listing_type", selectedListing);
    if (selectedArea) params.set("area", selectedArea);
    const qs = params.toString();
    router.replace(qs ? `/properties?${qs}` : "/properties", { scroll: false });
  };

  const activeFiltersCount = [
    selectedCity,
    selectedArea,
    selectedType,
    selectedListing,
    selectedFurnishing,
    selectedAmenities.length > 0,
  ].filter(Boolean).length;

  // Haversine formula for distance in km
  function getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
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
    if (selectedFurnishing && property.furnishing !== selectedFurnishing)
      return false;
    if (property.price < priceRange[0] || property.price > priceRange[1])
      return false;
    if (selectedAmenities.length > 0) {
      const hasAllAmenities = selectedAmenities.every((amenity) =>
        property.amenities?.includes(amenity),
      );
      if (!hasAllAmenities) return false;
    }
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
        property.longitude,
      );
      if (dist > nearbyRadius) return false;
    } else if (nearbyEnabled && !userLocation) {
      return false;
    }
    return true;
  });

  // Render Nearby toggle inside main JSX tree

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent py-10 sm:py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Find Your Perfect Property
            </h1>
            <p className="text-muted-foreground mb-6 sm:mb-8">
              Browse through {filteredProperties.length} properties across India
            </p>

            {/* Search card – aligned row on desktop, stacked on mobile */}
            <form
              className="rounded-2xl border bg-card/80 shadow-sm p-4 sm:p-5"
              onSubmit={(e) => {
                e.preventDefault();
                applySearch();
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-3 lg:items-end">
                {/* City */}
                <div className="lg:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    City
                  </label>
                  <HomeCitySelect
                    value={selectedCity}
                    onChange={(v) => {
                      setSelectedCity(v);
                      setSelectedArea("");
                    }}
                    placeholder="All Cities"
                    heightClass="h-11"
                  />
                </div>
                {/* Area */}
                <div className="lg:col-span-3 relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Area
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      className="h-11 bg-background pr-10 rounded-lg"
                      placeholder={
                        selectedCity
                          ? "e.g. Marathahalli, Koramangala"
                          : "e.g. Marathahalli (Bangalore)"
                      }
                      value={selectedArea}
                      autoComplete="off"
                      onChange={(e) => {
                        setSelectedArea(e.target.value);
                        if (!e.target.value.trim()) setAreaOptions([]);
                      }}
                      onFocus={() =>
                        areaOptions.length > 0 && setShowAreaSuggestions(true)
                      }
                      onBlur={() =>
                        setTimeout(() => setShowAreaSuggestions(false), 150)
                      }
                    />
                    {areaSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    {showAreaSuggestions && areaOptions.length > 0 && (
                      <ul className="absolute z-20 left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto py-1">
                        {areaOptions.map((area) => (
                          <li
                            key={area.id}
                            className="px-3 py-2 cursor-pointer hover:bg-accent/50 text-sm transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSelectedArea(area.text);
                              setAreaOptions([]);
                              setShowAreaSuggestions(false);
                              if (!selectedCity)
                                setSelectedCity(defaultSearchCity);
                            }}
                          >
                            {area.text}
                            {(selectedCity || defaultSearchCity) && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {selectedCity || defaultSearchCity}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {/* Filters */}
                <div className="lg:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block opacity-0 pointer-events-none">
                    Filters
                  </label>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 w-full justify-center gap-2 rounded-lg"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-1 h-5 min-w-5 px-1.5"
                          >
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filter Properties</SheetTitle>
                      </SheetHeader>
                      <div className="py-6 space-y-8">
                        <div>
                          <h3 className="font-medium mb-4">Property Type</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(propertyTypeIcons).map(
                              ([type, Icon]) => (
                                <button
                                  key={type}
                                  onClick={() =>
                                    setSelectedType(
                                      selectedType === type
                                        ? ""
                                        : (type as PropertyType),
                                    )
                                  }
                                  className={`p-3 rounded-xl border text-center transition-all ${
                                    selectedType === type
                                      ? "border-primary bg-primary/5"
                                      : "hover:border-primary/50"
                                  }`}
                                >
                                  <Icon
                                    className={`w-5 h-5 mx-auto mb-1 ${selectedType === type ? "text-primary" : ""}`}
                                  />
                                  <span className="text-xs capitalize">
                                    {type}
                                  </span>
                                </button>
                              ),
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-4">Price Range</h3>
                          <div className="px-2">
                            <Slider
                              value={priceRange}
                              onValueChange={setPriceRange}
                              max={50000000}
                              step={100000}
                              className="mb-4"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>
                                ₹{(priceRange[0] / 100000).toFixed(1)}L
                              </span>
                              <span>
                                ₹{(priceRange[1] / 10000000).toFixed(1)}Cr
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-4">Furnishing</h3>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "unfurnished",
                              "semi-furnished",
                              "fully-furnished",
                            ].map((type) => (
                              <button
                                key={type}
                                onClick={() =>
                                  setSelectedFurnishing(
                                    selectedFurnishing === type
                                      ? ""
                                      : (type as FurnishingType),
                                  )
                                }
                                className={`px-4 py-2 rounded-full border text-sm capitalize transition-all ${
                                  selectedFurnishing === type
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "hover:border-primary/50"
                                }`}
                              >
                                {type.replace("-", " ")}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-4">Amenities</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {AMENITIES.slice(0, 12).map((amenity) => (
                              <label
                                key={amenity}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={selectedAmenities.includes(amenity)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedAmenities([
                                        ...selectedAmenities,
                                        amenity,
                                      ]);
                                    } else {
                                      setSelectedAmenities(
                                        selectedAmenities.filter(
                                          (a) => a !== amenity,
                                        ),
                                      );
                                    }
                                  }}
                                />
                                <span className="text-sm">{amenity}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={clearFilters}
                          >
                            Clear All
                          </Button>
                          <Button
                            type="button"
                            className="flex-1"
                            onClick={applySearch}
                          >
                            Apply &amp; search
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                {/* Search */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block opacity-0 pointer-events-none select-none">
                    Search
                  </label>
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-lg gap-2 font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                </div>
              </div>
              {/* Popular in Bangalore */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm font-medium text-muted-foreground">
                  Popular in Bangalore:
                </span>
                {[
                  {
                    label: "2 BHK in Whitefield",
                    city: "Bangalore",
                    q: "2 BHK Whitefield",
                  },
                  {
                    label: "PG in Koramangala",
                    city: "Bangalore",
                    q: "PG Koramangala",
                  },
                  {
                    label: "Flat for rent Indiranagar",
                    city: "Bangalore",
                    q: "Flat rent Indiranagar",
                  },
                  { label: "Properties in ORR", city: "Bangalore", q: "ORR" },
                  {
                    label: "3 BHK Sarjapur Road",
                    city: "Bangalore",
                    q: "3 BHK Sarjapur",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setSelectedCity(item.city);
                      setSelectedArea(item.q);
                    }}
                    className="text-sm px-3 py-1.5 rounded-full bg-muted/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {selectedCity && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 py-1.5 px-2.5 rounded-md"
                >
                  {selectedCity}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => {
                      setSelectedCity("");
                      setSelectedArea("");
                    }}
                  />
                </Badge>
              )}
              {selectedArea && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 py-1.5 px-2.5 rounded-md"
                >
                  {selectedArea}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => setSelectedArea("")}
                  />
                </Badge>
              )}
              {selectedType && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 py-1.5 px-2.5 rounded-md capitalize"
                >
                  {selectedType}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => setSelectedType("")}
                  />
                </Badge>
              )}
              {selectedListing && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 py-1.5 px-2.5 rounded-md"
                >
                  {selectedListing === "sale"
                    ? "Buy"
                    : selectedListing === "rent"
                      ? "Rent"
                      : "Lease"}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );
                      params.delete("listing_type");
                      const qs = params.toString();
                      router.replace(
                        qs ? `/properties?${qs}` : "/properties",
                        { scroll: false },
                      );
                    }}
                  />
                </Badge>
              )}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-9 rounded-lg">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-lg border bg-background overflow-hidden">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`p-2.5 flex items-center gap-1.5 text-sm font-medium transition-colors ${showMap ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
                  title="Toggle Map View"
                >
                  <MapIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>

              <div className="flex rounded-lg border bg-background overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Home className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                No properties found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search criteria
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div
              className={`flex gap-6 ${showMap ? "flex-col lg:flex-row h-[calc(100vh-200px)]" : ""}`}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`overflow-y-auto pr-2 ${
                  showMap
                    ? "w-full lg:w-1/2 grid grid-cols-1 gap-6"
                    : viewMode === "grid"
                      ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
                      : "space-y-4 w-full"
                }`}
              >
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favoriteIds.has(property.id)}
                    onFavorite={
                      user?.role === "owner" ? undefined : handleFavorite
                    }
                    variant={viewMode === "list" ? "list" : "grid"}
                  />
                ))}
              </motion.div>

              {showMap && (
                <div className="w-full lg:w-1/2 h-125 lg:h-full sticky top-0">
                  <PropertyMap properties={filteredProperties} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
