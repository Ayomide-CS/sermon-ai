import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, JWT_COOKIE_NAME } from "@/app/lib/jwt";

// Routes that don't require authentication
const publicPaths = [
  "/",
  "/about",
  "/sermons",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/api/auth/",
];

// Routes that are API-only (no HTML redirect)
const apiPaths = ["/api/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // For dashboard routes, check authentication
  if (pathname.startsWith("/dashboard")) {
    // Try access token from Authorization header first (API/mobile clients)
    const authHeader = request.headers.get("authorization");
    let isAuthenticated = false;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = await verifyAccessToken(token);
      isAuthenticated = !!payload;
    }

    // Fall back to refresh cookie for browser clients
    if (!isAuthenticated) {
      const refreshToken = request.cookies.get(JWT_COOKIE_NAME)?.value;
      if (refreshToken) {
        // We can't easily verify the refresh token here without making an API call,
        // so we'll let the API routes handle the actual auth check.
        // The dashboard pages themselves will show login state via client-side auth context.
        isAuthenticated = true; // Trust the cookie for SSR redirect purposes
      }
    }

    if (!isAuthenticated) {
      // Redirect to home page (login/register available there)
      const url = new URL("/", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which paths the proxy runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
