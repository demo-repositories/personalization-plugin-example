import { createClient } from "@sanity/client";

// Create a minimal client for edge runtime (middleware)
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-01-27",
  useCdn: true,
});

export type RouteExperimentVariant = {
  pageId: string;
  pageSlug: string | null;
  pageType: string;
};

export type RouteExperimentPageVariant = {
  _key?: string;
  experimentId?: string;
  variantId: string;
  value: RouteExperimentVariant;
};

export type RouteExperimentPageExperiment = {
  experimentId?: string;
  default: RouteExperimentVariant;
  variants?: RouteExperimentPageVariant[];
};

export type RouteExperiment = {
  _id: string;
  name: string;
  targetRoute: string;
  page: RouteExperimentPageExperiment;
};

const ROUTE_EXPERIMENTS_QUERY = `
  *[_type == "routeExperiment" && isActive == true]{
    _id,
    name,
    targetRoute,
    page{
      experimentId,
      "default": {
        "pageId": default->_id,
        "pageSlug": default->slug.current,
        "pageType": default->_type
      },
      "variants": variants[]{
        _key,
        experimentId,
        variantId,
        "value": {
          "pageId": value->_id,
          "pageSlug": value->slug.current,
          "pageType": value->_type
        }
      }
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
  userVariant: string
): RouteExperimentVariant | null {
  const expPage = experiment.page;
  if (!expPage?.default?.pageId) return null;

  const variantMatch = expPage.variants?.find((v) => v.variantId === userVariant);
  if (variantMatch?.value?.pageId) return variantMatch.value;

  return expPage.default;
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
