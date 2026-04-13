"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const REPORT_REASONS = [
  "Listed by Broker",
  "Rented Out",
  "Wrong Info",
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

type Props = {
  propertyId: string;
  propertyTitle: string;
};

export function PropertyReportSection({ propertyId, propertyTitle }: Props) {
  const [pending, setPending] = useState<ReportReason | null>(null);

  const submit = async (reason: ReportReason) => {
    setPending(reason);
    try {
      const res = await fetch("/api/properties/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          propertyTitle,
          reason,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not send report"
        );
      }
      toast.success("Thanks — we'll review this listing.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      toast.error(message);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-start gap-3 sm:items-center">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-teal-600 text-sm font-bold leading-none text-white shadow-sm sm:mt-0 dark:bg-teal-500"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
          }}
          aria-hidden
        >
          !
        </div>
        <p className="text-sm font-medium leading-snug text-foreground sm:text-base">
          Report what was not correct in this property
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
        {REPORT_REASONS.map((label) => (
          <button
            key={label}
            type="button"
            disabled={pending !== null}
            onClick={() => void submit(label)}
            className="rounded-md border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-muted/80 disabled:opacity-60 dark:bg-card"
          >
            {pending === label ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sending…
              </span>
            ) : (
              label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
