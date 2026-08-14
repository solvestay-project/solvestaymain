/**
 * PG listings are only shown when explicitly browsing PG/Hostel (`property_type=pg`).
 * All other browse modes exclude them (rent, buy, lease, general search).
 */
export function applyPropertyTypeBrowseFilter<
  T extends { eq: (col: string, val: string) => T; neq: (col: string, val: string) => T },
>(
  query: T,
  propertyType: string | null | undefined,
): T {
  if (propertyType === "pg") {
    return query.eq("property_type", "pg");
  }

  let filtered = query.neq("property_type", "pg");

  if (propertyType && propertyType !== "all") {
    filtered = filtered.eq("property_type", propertyType);
  }

  return filtered;
}
