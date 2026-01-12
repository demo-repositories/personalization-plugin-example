import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setCookiesValue } from "./lib/experiments";

const EXPERIMENT_VARIANTS = ["control", "variant"];

export function middleware(request: NextRequest) {
  let response = NextResponse.next();
  response = setCookiesValue(request, response);

  // Handle blog post A/B test routing
  const pathname = request.nextUrl.pathname;
  
  // Match /blog/[slug] but not /blog/[slug]/[variant]
  // This regex matches /blog/something where "something" doesn't contain a slash
  if (pathname.match(/^\/blog\/[^\/]+$/) && !pathname.endsWith("/")) {
    // Get variant from existing cookie or the newly set one
    let userGroup = "control";
    
    const existingCookie = request.cookies.get("ab-test")?.value;
    if (existingCookie) {
      try {
        userGroup = JSON.parse(existingCookie).userGroup || "control";
      } catch {
        userGroup = "control";
      }
    } else {
      // Cookie was just set by setCookiesValue, read from response
      const newCookie = response.cookies.get("ab-test")?.value;
      if (newCookie) {
        try {
          userGroup = JSON.parse(newCookie).userGroup || "control";
        } catch {
          userGroup = "control";
        }
      }
    }

    // Ensure variant is valid
    const variant = EXPERIMENT_VARIANTS.includes(userGroup) ? userGroup : "control";

    // Rewrite to the variant-specific path
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/${variant}`;
    const rewriteResponse = NextResponse.rewrite(url);
    
    // Preserve cookies from the original response (including newly set ab-test cookie)
    response.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value, {
        ...cookie,
      });
    });
    
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
