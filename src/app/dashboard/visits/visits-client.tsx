"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VisitRequest } from "@/lib/types";
import {
  Loader2,
  Calendar,
  Clock,
  Building2,
  User,
  MessageSquare,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

type VisitRow = VisitRequest & {
  property?: { id: string; title: string; address?: string; city?: string };
  customer?: { full_name?: string; email?: string; phone?: string };
  owner?: { full_name?: string };
};

export default function VisitsClient() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("visit");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [visitRequests, setVisitRequests] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isOwner = user?.role === "owner";
  const visitsRole = isOwner ? "owner" : "customer";

  const loadVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/visits?role=${visitsRole}`);
      const data = await res.json();
      if (data.visit_requests) {
        setVisitRequests(data.visit_requests);
      } else {
        setVisitRequests([]);
      }
    } catch {
      setVisitRequests([]);
      toast.error("Could not load visit requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadVisits();
  }, [user, visitsRole]);

  useEffect(() => {
    if (!highlightId || loading) return;
    const el = cardRefs.current[highlightId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, loading, visitRequests]);

  const handleStatus = async (
    id: string,
    status: "confirmed" | "rejected",
    visit: VisitRow,
  ) => {
    setUpdatingId(id);
    try {
      const body: Record<string, string> = { status };
      if (status === "confirmed") {
        body.confirmed_date = visit.preferred_date;
        body.confirmed_time = visit.preferred_time;
      }
      if (status === "rejected") {
        const msg = window.prompt(
          "Optional note for the customer (they will see this in their notification):",
        );
        if (msg) body.owner_message = msg;
      }
      const res = await fetch(`/api/visits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success(
        status === "confirmed" ? "Visit confirmed" : "Visit declined",
      );
      await loadVisits();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update visit");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusVariant = (s: string) => {
    if (s === "confirmed") return "default" as const;
    if (s === "pending") return "secondary" as const;
    return "outline" as const;
  };

  if (!user) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Visit requests</h1>
            <p className="text-muted-foreground">
              {isOwner
                ? "Requests from buyers to see your listings. Confirm or decline from here."
                : "Visits you have scheduled with property owners."}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : visitRequests.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No visit requests yet.</p>
                {!isOwner && (
                  <Button asChild className="mt-6">
                    <Link href="/properties">Browse properties</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {visitRequests.map((visit) => {
                const highlighted = highlightId === visit.id;
                return (
                  <div
                    key={visit.id}
                    ref={(el) => {
                      cardRefs.current[visit.id] = el;
                    }}
                    className={
                      highlighted
                        ? "rounded-xl ring-2 ring-primary shadow-md p-0.5"
                        : ""
                    }
                  >
                  <Card className={highlighted ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary shrink-0" />
                            {visit.property?.title || "Property"}
                          </CardTitle>
                          <CardDescription>
                            {[visit.property?.address, visit.property?.city]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={statusVariant(visit.status)}
                          className="capitalize shrink-0"
                        >
                          {visit.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>
                            {new Date(visit.preferred_date).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{visit.preferred_time}</span>
                        </div>
                        {isOwner && visit.customer && (
                          <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                            <User className="w-4 h-4 shrink-0" />
                            <span>
                              {visit.customer.full_name || "Customer"}
                              {visit.customer.phone
                                ? ` · ${visit.customer.phone}`
                                : ""}
                            </span>
                          </div>
                        )}
                        {!isOwner && visit.owner && (
                          <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                            <User className="w-4 h-4 shrink-0" />
                            <span>
                              Owner: {visit.owner.full_name || "Property owner"}
                            </span>
                          </div>
                        )}
                      </div>
                      {visit.notes && (
                        <div className="flex gap-2 text-sm rounded-lg bg-muted/50 p-3">
                          <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{visit.notes}</span>
                        </div>
                      )}
                      {visit.status === "confirmed" &&
                        visit.confirmed_date && (
                          <p className="text-sm text-green-700 dark:text-green-400">
                            Confirmed for{" "}
                            {new Date(
                              visit.confirmed_date,
                            ).toLocaleDateString()}
                            {visit.confirmed_time
                              ? ` at ${visit.confirmed_time}`
                              : ""}
                          </p>
                        )}
                      {visit.status === "rejected" && visit.owner_message && (
                        <p className="text-sm text-muted-foreground">
                          Note: {visit.owner_message}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/properties/${visit.property_id}`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View property
                          </Link>
                        </Button>
                        {isOwner && visit.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              disabled={updatingId === visit.id}
                              onClick={() =>
                                handleStatus(visit.id, "confirmed", visit)
                              }
                            >
                              {updatingId === visit.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Confirm
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={updatingId === visit.id}
                              onClick={() =>
                                handleStatus(visit.id, "rejected", visit)
                              }
                            >
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
