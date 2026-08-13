"use client";

import { useEffect, useState } from "react";

/**
 * True when viewport is below the `lg` breakpoint (1024px).
 * Returns `null` until mounted so UI can avoid hydration flashes.
 */
export function useIsMobileLg(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
