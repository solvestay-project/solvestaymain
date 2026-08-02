"use client";

import { useEffect, useRef } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobileLg } from "@/hooks/useIsMobileLg";

export type AreaOption = { id: string; text: string };

type AreaSearchSuggestionsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Query typed inside the sheet (mobile) or the field (desktop) */
  query: string;
  onQueryChange: (value: string) => void;
  options: AreaOption[];
  onSelect: (option: AreaOption) => void;
  cityLabel?: string;
  title?: string;
  placeholder?: string;
  loading?: boolean;
};

export function AreaSearchSuggestions({
  open,
  onOpenChange,
  query,
  onQueryChange,
  options,
  onSelect,
  cityLabel,
  title = "Search area",
  placeholder = "Type area or locality…",
  loading = false,
}: AreaSearchSuggestionsProps) {
  const isMobile = useIsMobileLg();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && isMobile) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, isMobile]);

  if (isMobile === null) return null;

  const list = (
    <ul className="divide-y divide-border">
      {options.map((area) => (
        <li key={area.id}>
          <button
            type="button"
            className="flex w-full items-start gap-3 px-4 py-3.5 text-left text-sm transition-colors hover:bg-muted/60 active:bg-muted"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onSelect(area);
              onOpenChange(false);
            }}
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-foreground">
                {area.text}
              </span>
              {cityLabel && (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {cityLabel}
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

  // Mobile: search lives only inside the bottom sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="z-[60] flex min-h-[600px] max-h-[85vh] flex-col gap-0 rounded-t-2xl p-0 pb-[env(safe-area-inset-bottom,0px)]"
        >
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
          <SheetHeader className="px-4 pb-2 pt-3 text-left">
            <SheetTitle className="text-base">{title}</SheetTitle>
          </SheetHeader>

          <div className="border-b border-border px-4 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={placeholder}
                autoComplete="off"
                className="h-11 rounded-xl border-border bg-muted/40 pl-10 pr-10"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {!query.trim() && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Start typing to find an area
              </p>
            )}
            {query.trim() && !loading && options.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No areas found
              </p>
            )}
            {options.length > 0 && list}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: dropdown under the field (only when there are results)
  if (!open || options.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-popover py-1 text-left text-popover-foreground shadow-lg">
      {list}
    </div>
  );
}
