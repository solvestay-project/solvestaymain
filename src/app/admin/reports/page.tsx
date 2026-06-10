"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Loader2, ExternalLink } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type ReportRow = {
  id: string;
  property_id: string;
  reporter_id: string;
  property_title: string | null;
  reason: string;
  status: string;
  created_at: string;
  property: {
    id: string;
    title: string | null;
    city: string | null;
    status: string | null;
    is_active: boolean | null;
  } | null;
  reporter: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
};

export default function AdminPropertyReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/property-reports");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Failed to load",
          );
        }
        if (!cancelled) setReports(data.reports ?? []);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load reports");
        if (!cancelled) setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Listing reports</h1>
        <p className="mt-1 text-slate-500">
          Reports submitted from property pages by signed-in users.
        </p>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
          <div className="rounded-lg bg-amber-50 p-2">
            <Flag className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-900">Open queue</CardTitle>
            <CardDescription>
              {reports.length} report{reports.length === 1 ? "" : "s"} loaded
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {reports.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No reports yet. When users flag a listing, it will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.reason}</Badge>
                        {r.status !== "open" && (
                          <Badge variant="outline" className="ml-2">
                            {r.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <div className="truncate font-medium text-slate-900">
                          {r.property?.title ||
                            r.property_title ||
                            "Unknown title"}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {r.property?.city
                            ? `${r.property.city} · `
                            : ""}
                          ID {r.property_id.slice(0, 8)}…
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium text-slate-800">
                          {r.reporter?.full_name || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.reporter?.email || r.reporter_id}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/properties/${r.property_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gap-1"
                          >
                            View listing
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
