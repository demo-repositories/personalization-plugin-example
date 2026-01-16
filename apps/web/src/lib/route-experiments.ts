import { createClient } from "@sanity/client";

// Create a minimal client for edge runtime (middleware)
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-10-28",
  useCdn: true,
});

export type RouteExperimentVariant = {
  id: string;
  label?: string;
  weight?: number;
  pageId: string;
  pageSlug: string | null;
  pageType: string;
};

export type GeoTargeting = {
  country: string;
  pageId: string;
  pageSlug: string | null;
  pageType: string;
};

export type RouteExperiment = {
  _id: string;
  name: string;
  targetRoute: string;
  variants: RouteExperimentVariant[];
  geoTargeting?: GeoTargeting[];
};

const ROUTE_EXPERIMENTS_QUERY = `
  *[_type == "routeExperiment" && isActive == true]{
    _id,
    name,
    targetRoute,
    variants[]{
      id,
      label,
      weight,
      "pageId": page->_id,
      "pageSlug": page->slug.current,
      "pageType": page->_type
    },
    geoTargeting[]{
      country,
      "pageId": page->_id,
      "pageSlug": page->slug.current,
      "pageType": page->_type
    }
  }
`;

// Cache for route experiments
let cachedExperiments: RouteExperiment[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function getRouteExperiments(): Promise<RouteExperiment[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedExperiments && now - cacheTimestamp < CACHE_TTL) {
    return cachedExperiments;
  }

  try {
    const experiments = await client.fetch<RouteExperiment[]>(
      ROUTE_EXPERIMENTS_QUERY
    );
    cachedExperiments = experiments || [];
    cacheTimestamp = now;
    return cachedExperiments;
  } catch (error) {
    console.error("Failed to fetch route experiments:", error);
    // Return cached data even if stale, or empty array
    return cachedExperiments || [];
  }
}

export function getExperimentForRoute(
  experiments: RouteExperiment[],
  pathname: string
): RouteExperiment | undefined {
  return experiments.find((exp) => exp.targetRoute === pathname);
}

export function selectVariantPage(
  experiment: RouteExperiment,
  userVariant: string,
  countryCode?: string
): { pageId: string; pageSlug: string | null; pageType: string } | null {
  // Check geo targeting first (takes precedence)
  if (experiment.geoTargeting && experiment.geoTargeting.length > 0 && countryCode) {
    const geoMatch =
      experiment.geoTargeting.find(
        (g) => g.country.toUpperCase() === countryCode.toUpperCase()
      ) || experiment.geoTargeting.find((g) => g.country === "default");

    if (geoMatch) {
      return { pageId: geoMatch.pageId, pageSlug: geoMatch.pageSlug, pageType: geoMatch.pageType };
    }
  }

  // Fall back to variant-based selection
  if (experiment.variants && experiment.variants.length > 0) {
    // Find matching variant
    const variant = experiment.variants.find((v) => v.id === userVariant);
    if (variant) {
      return { pageId: variant.pageId, pageSlug: variant.pageSlug, pageType: variant.pageType };
    }

    // Fall back to control or first variant
    const control =
      experiment.variants.find((v) => v.id === "control") ||
      experiment.variants[0];
    if (control) {
      return { pageId: control.pageId, pageSlug: control.pageSlug, pageType: control.pageType };
    }
  }

  return null;
}

export function getRewritePath(
  pageSlug: string | null,
  pageType: string,
  userVariant: string
): string | null {
  // For homePage type, the slug might be "/" or null
  if (pageType === "homePage") {
    // Rewrite to a variant-specific internal route
    return `/home/${userVariant}`;
  }

  // For regular pages, use the slug with variant
  if (pageSlug) {
    return `${pageSlug}/${userVariant}`;
  }

  return null;
}
