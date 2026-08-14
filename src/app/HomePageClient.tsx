"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Search,
  MapPin,
  Home,
  Building2,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Eye,
  IndianRupee,
  Map,
  Phone,
  CreditCard,
  Key,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeCitySelect } from "@/components/HomeCitySelect";
import { AreaSearchSuggestions } from "@/components/AreaSearchSuggestions";
import { shortDisplayName } from "@/lib/utils";
import { useIsMobileLg } from "@/hooks/useIsMobileLg";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const propertyTypes = [
  {
    icon: Home,
    label: "Houses",
    count: "2,500+",
    href: "/houses-for-rent-in-bangalore",
  },
  {
    icon: Building2,
    label: "Apartments",
    count: "4,200+",
    href: "/properties?property_type=apartment",
  },
  {
    icon: Users,
    label: "PG/Hostels",
    count: "1,800+",
    href: "/properties?property_type=pg",
  },
  {
    icon: MapPin,
    label: "Land/Plots",
    count: "950+",
    href: "/properties?property_type=land",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Listings",
    description:
      "All properties undergo document verification ensuring authenticity and trust.",
  },
  {
    icon: Phone,
    title: "Direct Owner Contact",
    description:
      "Get owner phone, WhatsApp & email instantly. No middlemen, no brokerage.",
  },
  {
    icon: Eye,
    title: "360° Virtual Tours",
    description:
      "Explore properties from your home with immersive virtual reality tours.",
  },
  {
    icon: Map,
    title: "Interactive Maps",
    description:
      "Find properties on map with nearby schools, hospitals, and amenities.",
  },
  {
    icon: TrendingUp,
    title: "Price Analytics",
    description:
      "AI-powered fair market value predictions to help you negotiate better.",
  },
  {
    icon: CreditCard,
    title: "Affordable Plans",
    description:
      "Access owner contacts for just ₹99/day. No hidden fees or commissions.",
  },
];

const faqs = [
  {
    question: "How does Solvestay work?",
    answer:
      "Solvestay connects you directly with property owners. Browse verified listings, view 360° tours, and unlock owner contact (phone, WhatsApp, email) with an affordable pass. No brokers, no hidden fees.",
  },
  {
    question: "Is there any brokerage or commission?",
    answer:
      "No. We charge zero brokerage. You only pay for a short-term pass (from ₹99 for 2 days) to reveal owner contacts. Once you have the contact, you deal directly with the owner.",
  },
  {
    question: "How do I contact a property owner?",
    answer:
      "After signing up and choosing a plan, you can unlock contacts for the properties you’re interested in. You’ll get the owner’s phone number, WhatsApp, and email to reach out directly.",
  },
  {
    question: "Are the listings verified?",
    answer:
      "Yes. Property owners go through document verification before listing. We also encourage 360° virtual tours and clear photos so you can trust what you see.",
  },
  {
    question: "Can I list my property for free?",
    answer:
      "Yes. Owners can list properties for free. After verification, your listing goes live. You only get more visibility and tools if you opt for optional paid boosts.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, cards, net banking, and wallets. Payment is secure and you get instant access to contacts after a successful payment.",
  },
];

const pricingPlans = [
  {
    name: "Lite Plan (2-Day)",
    price: "99",
    period: "2 days",
    features: [
      "5 property contacts",
      "Basic search filters",
      "Chat with owners",
      "48 hours access",
      "AI Dream Home Search",
    ],
    popular: false,
  },
  {
    name: "Relax Plan (Weekly)",
    price: "150",
    period: "week",
    features: [
      "15 property contacts",
      "Advanced filters",
      "Priority support",
      "Save favorites",
      "7 days access",
      "AI Dream Home Search",
    ],
    popular: true,
  },
  {
    name: "Freedom Plan (Monthly)",
    price: "499",
    period: "month",
    features: [
      "25 property contacts",
      "Advanced search filters",
      "Priority support",
      "Save favorites",
      "Chat with owners",
      "30 days access",
      "AI Dream Home Search",
    ],
    popular: false,
  },
];

const stats = [
  { value: "50K+", label: "Properties Listed" },
  { value: "2L+", label: "Happy Customers" },
  { value: "20+", label: "Cities Covered" },
  { value: "₹0", label: "Brokerage Fee" },
];

/** Hero backdrop — modern home at dusk (reference-style full-bleed) */
const HOME_HERO_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=80";

const SELL_CTA_BG_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80";

/* Key Bangalore areas — kept for reference
const bangaloreAreas = [
  { name: "Whitefield", tag: "Key area", search: "Whitefield" },
  { name: "Outer Ring Road (ORR)", tag: "Key area", search: "ORR" },
  { name: "Koramangala", tag: "Key area", search: "Koramangala" },
  { name: "Indiranagar", tag: "Key area", search: "Indiranagar" },
  { name: "Devanahalli", tag: "Emerging", search: "Devanahalli" },
  { name: "Sarjapur Road", tag: "Emerging", search: "Sarjapur" },
];
*/

export default function HomePageClient() {
  const router = useRouter();
  const isMobile = useIsMobileLg();
  const [searchQuery, setSearchQuery] = useState("");
  const [areaDraft, setAreaDraft] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [areaOptions, setAreaOptions] = useState<
    { id: string; text: string }[]
  >([]);
  const [areaSearching, setAreaSearching] = useState(false);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

  const defaultSearchCity = "Bangalore";

  const fetchAreaSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setAreaOptions([]);
        return;
      }
      const cityForSearch = selectedCity || defaultSearchCity;
      setAreaSearching(true);
      try {
        const res = await fetch(
          `/api/place?q=${encodeURIComponent(query + ", " + cityForSearch)}&limit=6`,
        );
        const data = await res.json();
        const places = data.success && data.places ? data.places : [];
        const options = places.map((p: any, i: number) => ({
          id: `${p.display_name}-${i}`,
          text: shortDisplayName(p.display_name) || p.area || "",
        }));
        setAreaOptions(options);
      } catch {
        setAreaOptions([]);
      } finally {
        setAreaSearching(false);
      }
    },
    [selectedCity],
  );

  // Desktop: type in the field. Mobile: type only inside the sheet (areaDraft).
  const activeAreaQuery = isMobile ? areaDraft : searchQuery;

  useEffect(() => {
    if (isMobile === null) return;
    if (isMobile && !showAreaSuggestions) return;

    if (!activeAreaQuery.trim()) {
      setAreaOptions([]);
      if (!isMobile) setShowAreaSuggestions(false);
      return;
    }
    const t = setTimeout(() => fetchAreaSuggestions(activeAreaQuery), 200);
    return () => clearTimeout(t);
  }, [
    activeAreaQuery,
    selectedCity,
    fetchAreaSuggestions,
    isMobile,
    showAreaSuggestions,
  ]);

  useEffect(() => {
    if (isMobile) return;
    if (areaOptions.length > 0) setShowAreaSuggestions(true);
  }, [areaOptions.length, isMobile]);

  const handleSearch = (overrides?: { city?: string; q?: string }) => {
    const params = new URLSearchParams();
    const q = overrides?.q ?? searchQuery;
    const city = overrides?.city ?? selectedCity;
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    router.push(`/properties?${params.toString()}`);
  };

  const popularBangaloreSearches = [
    { label: "2 BHK in Whitefield", city: "Bangalore", q: "2 BHK Whitefield" },
    { label: "PG in Koramangala", city: "Bangalore", q: "PG Koramangala" },
    {
      label: "Flat for rent Indiranagar",
      city: "Bangalore",
      q: "Flat rent Indiranagar",
    },
    { label: "Properties in ORR", city: "Bangalore", q: "ORR" },
    { label: "3 BHK Sarjapur Road", city: "Bangalore", q: "3 BHK Sarjapur" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative flex  min-h-auto flex-col justify-center overflow-x-clip overflow-y-visible lg:min-h-[92vh]">
        <div className="absolute inset-0">
          <Image
            src={HOME_HERO_IMAGE}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/55" aria-hidden />
        </div>

        <div className="relative z-10 mx-auto w-full min-w-0  max-w-480 px-4 pt-24 pb-10 sm:px-6 sm:pb-14 lg:px-12 lg:pt-28 lg:pb-36">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto w-full min-w-0 max-w-6xl text-center"
          >
            <motion.div variants={fadeIn}>
              <Badge
                variant="secondary"
                className="mb-4 px-4 py-2 text-sm font-medium border border-white/25 bg-white/10 text-white backdrop-blur-md shadow-sm lg:mb-6"
              >
                <Sparkles className="w-4 h-4 mr-2 text-accent" />
                Zero Brokerage Property Platform
              </Badge>
            </motion.div>

            <motion.p
              variants={fadeIn}
              className="mb-2 text-sm font-semibold tracking-[0.18em] text-accent uppercase lg:hidden"
            >
              Solvestay
            </motion.p>

            <motion.h1
              variants={fadeIn}
              className="text-3xl font-bold tracking-tight mb-4 text-white drop-shadow-md sm:text-4xl lg:mb-6 lg:text-7xl"
            >
              Find Your{" "}
              <span className="font-semibold text-accent">Perfect</span>
              <br />
              Home Today
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="mb-6 text-base text-white/85 max-w-3xl mx-auto sm:text-lg lg:mb-10 lg:text-xl"
            >
              Connect directly with property owners. No brokers, no hidden fees.
              Get owner contact for just{" "}
              <span className="text-accent font-semibold">₹99</span>.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="mx-auto box-border w-full min-w-0 max-w-5xl rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 sm:rounded-3xl sm:p-2.5 lg:rounded-full"
            >
              <div className="flex min-w-0 flex-col gap-2 overflow-hidden rounded-xl bg-white sm:rounded-2xl lg:flex-row lg:items-stretch lg:gap-0 lg:divide-x lg:divide-border lg:rounded-none lg:overflow-visible lg:bg-transparent">
                <div className="flex w-full min-w-0 shrink-0 items-center px-2 py-1  lg:w-54 lg:px-3 lg:py-0">
                  <HomeCitySelect
                    value={selectedCity}
                    onChange={setSelectedCity}
                    placeholder="All Cities"
                    heightClass="h-12 sm:h-14"
                    triggerClassName="!bg-transparent hover:!bg-primary/10 hover:!text-primary rounded-xl lg:rounded-full border-0 shadow-none"
                  />
                </div>
                <div className="relative flex min-w-0 flex-1 items-center px-2 py-1 lg:px-4 lg:py-0">
                  <Search className="pointer-events-none absolute left-5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground lg:left-5" />
                  {/* Mobile: tap opens bottom sheet with search */}
                  <button
                    type="button"
                    className="flex h-12 w-full min-w-0 items-center rounded-xl border-0 bg-muted/40 pl-12 pr-3 text-left text-base sm:h-14 lg:hidden"
                    onClick={() => {
                      setAreaDraft("");
                      setAreaOptions([]);
                      setShowAreaSuggestions(true);
                    }}
                  >
                    <span
                      className={
                        searchQuery
                          ? "truncate text-foreground"
                          : "truncate text-muted-foreground"
                      }
                    >
                      {searchQuery ||
                        (selectedCity
                          ? `Search area in ${selectedCity}`
                          : "Search area, locality…")}
                    </span>
                  </button>
                  {/* Desktop: type directly in the field */}
                  <Input
                    placeholder={
                      selectedCity
                        ? `Search area, locality or property in ${selectedCity}`
                        : "Search area, locality or property in Bangalore"
                    }
                    className="hidden h-12 min-w-0 rounded-xl border-0 bg-muted/40 pl-12 text-base sm:h-14 lg:block lg:rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      areaOptions.length > 0 && setShowAreaSuggestions(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowAreaSuggestions(false), 150)
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <AreaSearchSuggestions
                    open={showAreaSuggestions}
                    onOpenChange={(open) => {
                      setShowAreaSuggestions(open);
                      if (!open) {
                        setAreaDraft("");
                        setAreaOptions([]);
                      }
                    }}
                    query={isMobile ? areaDraft : searchQuery}
                    onQueryChange={(v) => {
                      if (isMobile) setAreaDraft(v);
                      else setSearchQuery(v);
                    }}
                    options={areaOptions}
                    loading={areaSearching}
                    cityLabel={selectedCity || undefined}
                    title="Search area"
                    placeholder={
                      selectedCity
                        ? `Area in ${selectedCity}`
                        : "Area or locality…"
                    }
                    onSelect={(area) => {
                      setSearchQuery(area.text);
                      setAreaDraft("");
                      if (!selectedCity) setSelectedCity(defaultSearchCity);
                      setAreaOptions([]);
                    }}
                  />
                </div>
                <div className="flex w-full min-w-0 shrink-0 items-stretch px-2 pb-1 lg:w-auto lg:p-0">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-xl px-8 shadow-md sm:h-14 lg:w-auto lg:min-w-42  lg:rounded-full"
                    onClick={() => handleSearch()}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="mx-auto mt-4 w-full min-w-0 max-w-5xl space-y-3 text-center lg:mt-6"
            >
              <p className="text-sm text-white/80">Popular in Bangalore:</p>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:justify-center lg:overflow-visible lg:px-0.5 lg:pb-0">
                {popularBangaloreSearches.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSearch({ city: item.city, q: item.q })}
                    className="shrink-0 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-primary sm:px-4"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="mt-10 flex flex-wrap justify-center gap-6 px-2 pb-8 sm:mt-16 sm:gap-10 sm:pb-10 md:gap-14"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center min-w-28">
                  <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 hidden h-24 bg-background pointer-events-none z-1 lg:block" />
      </section>

      {/* App shortcuts — compact on mobile; fuller cards on desktop */}
      <section className="bg-background py-5 lg:bg-muted/40 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-medium text-muted-foreground lg:hidden">
            Browse by type
          </p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-4 gap-2 lg:grid-cols-4 lg:gap-6"
          >
            {propertyTypes.map((type) => (
              <motion.div key={type.label} variants={fadeIn}>
                <Link
                  href={type.href}
                  className="group flex h-full flex-col items-center rounded-2xl border border-border/60 bg-card p-3 text-center shadow-sm transition-all duration-300 hover:border-primary/35 hover:shadow-md sm:p-4 lg:items-start lg:p-6 lg:text-left lg:hover:-translate-y-0.5 lg:hover:shadow-xl lg:sm:p-8"
                >
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/18 lg:mb-4 lg:h-14 lg:w-14">
                    <type.icon className="h-5 w-5 text-primary lg:h-7 lg:w-7" />
                  </div>
                  <h3 className="text-xs font-semibold leading-tight lg:text-lg">
                    {type.label}
                  </h3>
                  <p className="mt-0.5 hidden text-sm text-muted-foreground lg:block">
                    {type.count} listings
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4">
                Why Choose Solvestay
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug mb-4"
            >
              Everything You Need to
              <br />
              <span className="text-accent font-semibold">Find Your Home</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              We&apos;ve built India&apos;s most transparent property platform
              with features designed to make your search effortless.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, fi) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                className="p-6 sm:p-8 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${
                    fi % 2 === 0
                      ? "bg-primary/12"
                      : "bg-accent/15 dark:bg-primary/15"
                  }`}
                >
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-muted/30 py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
              Have a property to sell?
            </h2>

            <div
              className="relative overflow-hidden rounded-2xl border border-primary/25 shadow-lg min-h-[220px] sm:min-h-[240px]"
            >
              <Image
                src={SELL_CTA_BG_IMAGE}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/82 to-primary/70"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
                aria-hidden
              />

              <div
                className="pointer-events-none absolute left-6 top-6 hidden sm:block"
                aria-hidden
              >
                <Key className="h-8 w-8 text-accent/50" />
              </div>
              <div
                className="pointer-events-none absolute right-6 top-6 hidden sm:block"
                aria-hidden
              >
                <Building2 className="h-9 w-9 text-white/25" />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center px-6 py-10 sm:py-14 text-center">
                <p className="max-w-lg text-lg sm:text-xl font-medium text-white mb-6 sm:mb-8 drop-shadow-sm">
                  List your property & connect with clients faster!
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 min-w-[200px] rounded-xl border-2 border-white/90 bg-white/10 text-white font-semibold shadow-md backdrop-blur-sm hover:bg-white hover:text-primary"
                >
                  <Link href="/auth/register?role=owner">
                    Sell your property
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Explore Properties in Key Bangalore Areas — replaced by owner CTA above
      <section className="bg-muted/30 py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4">
                Bangalore
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug mb-4"
            >
              Explore Properties in
              <br />
              <span className="text-accent font-semibold">
                Key Bangalore Areas
              </span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Whitefield, Outer Ring Road (ORR), Koramangala, Indiranagar, and
              emerging areas like Devanahalli and Sarjapur Road.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
          >
            {bangaloreAreas.map((area) => (
              <motion.div key={area.name} variants={fadeIn} className="h-full">
                <Link
                  href={`/properties?city=Bangalore&q=${encodeURIComponent(area.search)}`}
                  className="group flex h-full items-center gap-4 p-5 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {area.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{area.tag}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      */}

      <section className="relative overflow-hidden bg-muted/40 py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4">
                Simple Pricing
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug mb-4"
            >
              Affordable Plans for
              <br />
              <span className="text-accent font-semibold">Everyone</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Pay only when you need to contact property owners. No subscription
              traps.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeIn}
                className={`relative p-8 rounded-2xl ${
                  plan.popular
                    ? "border-2 border-accent bg-primary text-white scale-105 shadow-2xl"
                    : "bg-card border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-primary border-0 shadow-md">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <h3
                  className={`text-xl font-semibold mb-2 ${plan.popular ? "text-accent" : ""}`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <IndianRupee
                    className={`w-6 h-6 ${plan.popular ? "text-accent" : ""}`}
                  />
                  <span
                    className={`text-5xl font-bold ${plan.popular ? "text-accent" : ""}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={
                      plan.popular ? "text-white/75" : "text-muted-foreground"
                    }
                  >
                    /{plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          plan.popular ? "text-accent" : "text-primary"
                        }`}
                      />
                      <span className={plan.popular ? "text-white/95" : ""}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${
                    plan.popular
                      ? "bg-background text-foreground hover:bg-background/90"
                      : ""
                  }`}
                  variant={plan.popular ? "secondary" : "default"}
                >
                  <Link href="/pricing">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-muted/30 py-12 sm:py-20 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4">
                FAQ
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug mb-4"
            >
              Frequently Asked
              <br />
              <span className="text-accent font-semibold">Questions</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-muted-foreground text-lg max-w-xl mx-auto"
            >
              Everything you need to know about Solvestay and how we help you
              find your perfect property.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border rounded-lg px-6 mb-3 bg-card data-[state=open]:border-primary/30"
                  >
                    <AccordionTrigger className="text-left font-semibold py-6 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
        <div className="max-w-5xl mx-auto rounded-3xl bg-primary px-6 py-14 sm:px-12 sm:py-16 text-primary-foreground shadow-xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Ready to Find Your Dream Home?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-xl text-primary-foreground/80 mb-10"
            >
              Join over 2 lakh happy customers who found their perfect property
              on Solvestay.
            </motion.p>
            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                asChild
                size="lg"
                className="text-lg px-8 bg-white text-primary hover:bg-white/90 shadow-md"
              >
                <Link href="/properties">
                  Browse Properties
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent border-white/40 text-white hover:bg-white/10"
              >
                <Link href="/auth/register?role=owner">
                  List Your Property Free
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
