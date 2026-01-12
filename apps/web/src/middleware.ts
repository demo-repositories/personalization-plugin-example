import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setCookiesValue } from "./lib/experiments";
import {
  getRouteExperiments,
  getExperimentForRoute,
  selectVariantPage,
} from "./lib/route-experiments";

const EXPERIMENT_VARIANTS = ["control", "variant", "variant-a", "variant-b", "variant-c"];

function getUserVariant(request: NextRequest, response: NextResponse): string {
  // Check existing cookie first
  const existingCookie = request.cookies.get("ab-test")?.value;
  if (existingCookie) {
    try {
      return JSON.parse(existingCookie).userGroup || "control";
    } catch {
      return "control";
    }
  }

  // Check newly set cookie
  const newCookie = response.cookies.get("ab-test")?.value;
  if (newCookie) {
    try {
      return JSON.parse(newCookie).userGroup || "control";
    } catch {
      return "control";
    }
  }

  return "control";
}

function preserveCookies(source: NextResponse, target: NextResponse): void {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value);
  });
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();
  response = setCookiesValue(request, response);

  const pathname = request.nextUrl.pathname;
  const userVariant = getUserVariant(request, response);
  // Geo is available on Vercel Edge, may be undefined locally
  const countryCode = (request as NextRequest & { geo?: { country?: string } }).geo?.country;

  // ===========================================
  // Route Experiments (CMS-driven)
  // ===========================================
  try {
    const experiments = await getRouteExperiments();
    const experiment = getExperimentForRoute(experiments, pathname);

    if (experiment) {
      const selectedPage = selectVariantPage(experiment, userVariant, countryCode);

      if (selectedPage) {
        const url = request.nextUrl.clone();

        // For homePage, rewrite to /home/[variant]
        if (selectedPage.pageType === "homePage") {
          url.pathname = `/home/${userVariant}`;
        } else if (selectedPage.pageSlug) {
          // For regular pages, rewrite to /[slug]/[variant]
          url.pathname = `${selectedPage.pageSlug}/${userVariant}`;
        }

        if (url.pathname !== pathname) {
          const rewriteResponse = NextResponse.rewrite(url);
          preserveCookies(response, rewriteResponse);
          return rewriteResponse;
        }
      }
    }
  } catch (error) {
    console.error("Route experiment middleware error:", error);
    // Continue with normal routing if experiments fail
  }

  // ===========================================
  // Blog Post A/B Test Routing (hardcoded)
  // ===========================================
  if (pathname.match(/^\/blog\/[^\/]+$/) && !pathname.endsWith("/")) {
    const variant = EXPERIMENT_VARIANTS.includes(userVariant) ? userVariant : "control";
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/${variant}`;
    const rewriteResponse = NextResponse.rewrite(url);
    preserveCookies(response, rewriteResponse);
    return rewriteResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
