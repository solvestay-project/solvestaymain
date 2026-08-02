"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Handshake,
  Home,
  KeyRound,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80";
const MISSION_IMAGE =
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const pillars = [
  {
    icon: ShieldCheck,
    title: "Listings you can trust",
    body: "Owners list homes, apartments, and PGs with verification so seekers know who they are dealing with.",
  },
  {
    icon: Phone,
    title: "Direct owner contact",
    body: "With an active pass, reveal phone, WhatsApp, or email and talk on your terms — no middleman cut.",
  },
  {
    icon: KeyRound,
    title: "Simple, fair plans",
    body: "Lite, Relax, and Freedom fit short trials or serious search windows. Pay for access when you need it.",
  },
];

export function AboutPageClient() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero — one composition: brand, headline, line, CTAs, full-bleed image */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pt-20 lg:pt-24">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Bright modern living space"
            fill
            priority
            className="object-cover object-[center_40%]"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#083b3a] via-[#083b3a]/75 to-[#083b3a]/35"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 pt-10 sm:pb-20 sm:pt-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.p
              variants={fadeUp}
              className="mb-4 text-accent text-sm sm:text-base font-semibold tracking-[0.2em] uppercase"
            >
              Solvestay
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]"
            >
              Homes without the brokerage maze
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-5 text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed"
            >
              We connect renters and buyers directly with verified property
              owners — clear listings, honest details, conversations that matter.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Button
                asChild
                size="lg"
                className="bg-accent text-primary hover:bg-accent/90 font-semibold"
              >
                <Link href="/properties">
                  Browse properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              >
                <Link href="/pricing">View plans</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission — one job */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 100% 0%, rgba(199,154,74,0.12), transparent), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(8,59,58,0.08), transparent)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <Image
                src={MISSION_IMAGE}
                alt="Quiet residential interior with natural light"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-accent font-semibold tracking-wide text-sm uppercase mb-3">
                Our mission
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Make renting and buying simpler — and fairer
              </h2>
              <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
                Traditional listings often hide costs behind brokers. Solvestay
                focuses on clarity: real photos, honest details, and direct
                conversations with owners so you can decide faster with less
                friction.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We exist so seekers and owners meet without a chain of
                intermediaries inflating the journey.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What we do — editorial rows, not a card dashboard */}
      <section className="border-y border-border bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-14"
          >
            <p className="text-accent font-semibold tracking-wide text-sm uppercase mb-3">
              What we do
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              A clearer path from search to handshake
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Three things we get right so your next move feels confident.
            </p>
          </motion.div>

          <div className="divide-y divide-border">
            {pillars.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="grid sm:grid-cols-[4rem_1fr] gap-4 sm:gap-8 py-8 first:pt-0 last:pb-0"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                  <item.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed max-w-2xl">
                    {item.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Zero brokerage */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-primary text-primary-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(199,154,74,0.35), transparent 45%), radial-gradient(circle at 85% 70%, rgba(255,255,255,0.08), transparent 40%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Handshake className="h-6 w-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Zero brokerage mindset
            </h2>
            <p className="mt-5 text-lg text-white/75 leading-relaxed">
              We do not charge brokerage for connecting seekers and owners on
              the platform. Our revenue comes from optional passes and
              value-added features — not from inflating rent or sale prices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-12 max-w-2xl"
          >
            <p className="text-accent font-semibold tracking-wide text-sm uppercase mb-3">
              Who we serve
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for both sides of the deal
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 flex items-center gap-3">
                <Users className="h-6 w-6 text-accent" strokeWidth={1.75} />
                <h3 className="text-2xl font-semibold tracking-tight">
                  Seekers
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Families, students, and professionals looking for rent,
                purchase, or PG options across cities — with tools to search,
                shortlist, and reach owners directly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <div className="mb-4 flex items-center gap-3">
                <Home className="h-6 w-6 text-accent" strokeWidth={1.75} />
                <h3 className="text-2xl font-semibold tracking-tight">
                  Owners
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Individuals and landlords who want serious enquiries without
                paying a chain of intermediaries — list once, connect with
                genuine interest.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0a4a48] to-[#062e2d] px-8 py-14 sm:px-14 sm:py-16 text-center"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 0%, rgba(199,154,74,0.25), transparent 55%)",
              }}
              aria-hidden
            />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Ready to find your next place?
              </h2>
              <p className="mt-4 text-white/75 text-lg max-w-xl mx-auto">
                Browse verified listings or pick a pass that matches how long
                you need to search.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-primary hover:bg-accent/90 font-semibold"
                >
                  <Link href="/properties">
                    Explore listings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/auth/register">Create account</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
