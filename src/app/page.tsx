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
    href: "/properties?property_type=house",
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
      "Access owner contacts for just ₹49/day. No hidden fees or commissions.",
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
      "No. We charge zero brokerage. You only pay for a short-term pass (from ₹49 for 2 days) to reveal owner contacts. Once you have the contact, you deal directly with the owner.",
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
    price: "49",
    period: "2 days",
    features: [
      "5 property contacts",
      "Basic search filters",
      "Chat with owners",
      "48 hours access",
    ],
    popular: false,
  },
  {
    name: "Relax Plan (Weekly)",
    price: "150",
    period: "week",
    features: [
      "20 property contacts",
      "Advanced filters",
      "Priority support",
      "Save favorites",
      "7 days access",
    ],
    popular: true,
  },
  {
    name: "Freedom Plan (Monthly)",
    price: "499",
    period: "month",
    features: [
      "20 property contacts",
      "Advanced search filters",
      "Priority support",
      "Save favorites",
      "Chat with owners",
      "30 days access",
      "Price insights",
      "Get early listing",
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

const bangaloreAreas = [
  { name: "Whitefield", tag: "Key area", search: "Whitefield" },
  { name: "Outer Ring Road (ORR)", tag: "Key area", search: "ORR" },
  { name: "Koramangala", tag: "Key area", search: "Koramangala" },
  { name: "Indiranagar", tag: "Key area", search: "Indiranagar" },
  { name: "Devanahalli", tag: "Emerging", search: "Devanahalli" },
  { name: "Sarjapur Road", tag: "Emerging", search: "Sarjapur" },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [areaOptions, setAreaOptions] = useState<
    { id: string; text: string }[]
  >([]);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

  const defaultSearchCity = "Bangalore";

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
        const options = places.map((p: any, i: number) => ({
          id: `${p.display_name}-${i}`,
          text: p.area || p.display_name || "",
        }));
        setAreaOptions(options);
      } catch {
        setAreaOptions([]);
      }
    },
    [selectedCity],
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setAreaOptions([]);
      setShowAreaSuggestions(false);
      return;
    }
    const t = setTimeout(() => fetchAreaSuggestions(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery, selectedCity, fetchAreaSuggestions]);

  useEffect(() => {
    if (areaOptions.length > 0) setShowAreaSuggestions(true);
  }, [areaOptions.length]);

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

      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-x-clip overflow-y-visible">
        <div className="absolute inset-0">
          <Image
            src={HOME_HERO_IMAGE}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-background"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto w-full min-w-0 max-w-[120rem] px-4 sm:px-6 lg:px-12 pt-28 pb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto w-full min-w-0 max-w-6xl text-center"
          >
            <motion.div variants={fadeIn}>
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-2 text-sm font-medium border border-white/25 bg-white/10 text-white backdrop-blur-md shadow-sm"
              >
                <Sparkles className="w-4 h-4 mr-2 text-indigo-200" />
                Zero Brokerage Property Platform
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-md"
            >
              Find Your{" "}
              <span className="font-serif italic text-indigo-100">Perfect</span>
              <br />
              Home Today
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg sm:text-xl text-white/85 max-w-3xl mx-auto mb-10"
            >
              Connect directly with property owners. No brokers, no hidden fees.
              Get owner contact for just{" "}
              <span className="text-indigo-100 font-semibold">₹49</span>.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="mx-auto box-border w-full min-w-0 max-w-5xl rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 sm:rounded-3xl sm:p-2.5 lg:rounded-full"
            >
              <div className="flex min-w-0 flex-col gap-2 overflow-hidden rounded-xl bg-white sm:rounded-2xl lg:flex-row lg:items-stretch lg:gap-0 lg:divide-x lg:divide-border lg:rounded-none lg:overflow-visible lg:bg-transparent">
                <div className="flex w-full min-w-0 shrink-0 items-center px-2 py-1 lg:w-[13.5rem] lg:px-3 lg:py-0">
                  <HomeCitySelect
                    value={selectedCity}
                    onChange={setSelectedCity}
                    placeholder="All Cities"
                    heightClass="h-12 sm:h-14"
                    triggerClassName="!bg-transparent hover:!bg-muted/40 rounded-xl lg:rounded-full border-0 shadow-none"
                  />
                </div>
                <div className="relative flex min-w-0 flex-1 items-center px-2 py-1 lg:px-4 lg:py-0">
                  <Search className="pointer-events-none absolute left-5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground lg:left-5" />
                  <Input
                    placeholder={
                      selectedCity
                        ? `Search area, locality or property in ${selectedCity}`
                        : "Search area, locality or property in Bangalore"
                    }
                    className="h-12 min-w-0 rounded-xl border-0 bg-muted/40 pl-12 text-base sm:h-14 lg:rounded-full"
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
                  {showAreaSuggestions && areaOptions.length > 0 && (
                    <ul className="absolute z-20 left-2 right-2 lg:left-4 lg:right-4 top-full mt-1 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg overflow-hidden py-1 text-left">
                      {areaOptions.map((area) => (
                        <li
                          key={area.id}
                          className="px-4 py-2.5 cursor-pointer hover:bg-accent text-sm transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(area.text);
                            if (!selectedCity)
                              setSelectedCity(defaultSearchCity);
                            setAreaOptions([]);
                            setShowAreaSuggestions(false);
                          }}
                        >
                          {area.text}
                          {selectedCity && (
                            <span className="ml-2 text-muted-foreground text-xs">
                              {selectedCity}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex w-full min-w-0 shrink-0 items-stretch px-2 pb-1 lg:w-auto lg:p-0">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-xl px-8 shadow-md sm:h-14 lg:w-auto lg:min-w-[10.5rem] lg:rounded-full"
                    onClick={handleSearch}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="mx-auto mt-6 w-full min-w-0 max-w-5xl space-y-3 text-center"
            >
              <p className="text-sm text-white/80">Popular in Bangalore:</p>
              <div className="flex flex-wrap justify-center gap-2 px-0.5">
                {popularBangaloreSearches.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSearch({ city: item.city, q: item.q })}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-primary sm:px-4"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="mt-16 flex flex-wrap justify-center gap-6 px-2 sm:gap-10 md:gap-14"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center min-w-[7rem]">
                  <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-[1]" />
      </section>

      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {propertyTypes.map((type) => (
              <motion.div key={type.label} variants={fadeIn}>
                <Link
                  href={type.href}
                  className="group block h-full p-6 sm:p-8 bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/35 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/18 transition-colors">
                    <type.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{type.label}</h3>
                  <p className="text-muted-foreground text-sm">
                    {type.count} listings
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
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
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            >
              Everything You Need to
              <br />
              <span className="text-gradient font-serif italic">
                Find Your Home
              </span>
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
                      : "bg-indigo-100/90 dark:bg-primary/15"
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

      <section className="py-20 lg:py-32 bg-muted/30">
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
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            >
              Explore Properties in
              <br />
              <span className="text-gradient font-serif italic">
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
            {bangaloreAreas.map((area, index) => (
              <motion.div key={area.name} variants={fadeIn}>
                <Link
                  href={`/properties?city=Bangalore&q=${encodeURIComponent(area.search)}`}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
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

      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
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
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            >
              Affordable Plans for
              <br />
              <span className="text-gradient font-serif italic">Everyone</span>
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
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground scale-105 shadow-2xl"
                    : "bg-card border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-background text-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <IndianRupee className="w-6 h-6" />
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span
                    className={
                      plan.popular
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }
                  >
                    /{plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 ${plan.popular ? "text-primary-foreground" : "text-primary"}`}
                      />
                      <span
                        className={
                          plan.popular ? "text-primary-foreground/90" : ""
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${plan.popular ? "bg-background text-foreground hover:bg-background/90" : ""}`}
                  variant={plan.popular ? "secondary" : "default"}
                >
                  <Link href="/pricing">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-muted/30">
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
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            >
              Frequently Asked
              <br />
              <span className="text-gradient font-serif italic">Questions</span>
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

      <section className="py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-primary via-primary to-indigo-700 px-6 py-14 sm:px-12 sm:py-16 text-primary-foreground shadow-xl text-center">
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
