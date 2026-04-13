import { Suspense } from "react";
import VisitsClient from "./visits-client";

function VisitsPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-hidden
      />
    </div>
  );
}

export default function VisitsPage() {
  return (
    <Suspense fallback={<VisitsPageFallback />}>
      <VisitsClient />
    </Suspense>
  );
}
