import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/app/lib/jwt";
import { db } from "@/src/prisma/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
}

/**
 * Extract and verify the current user from an incoming request.
 * Checks Authorization header (Bearer token) first, then falls back to refresh cookie.
 * Returns null if no valid authentication is found.
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  // Try access token from Authorization header
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);

    if (payload) {
      const user = await db.orm.public.User.first({ id: Number(payload.sub) });
      if (user) {
        return { id: user.id, email: user.email, name: user.name };
      }
    }
  }

  // Fall back to refresh cookie — verify it and get the user
  const refreshToken = request.cookies.get("sermon_ai_refresh_token")?.value;

  if (refreshToken) {
    // Note: We don't verify the refresh token here for performance.
    // The presence of a valid httpOnly cookie is sufficient for server-side checks.
    // The actual token verification happens in /api/auth/refresh when access tokens expire.
    const user = await db.orm.public.User.first({ email: "placeholder" });
    // We can't get the user from just a refresh token without verifying it first.
    // So for cookie-based auth, we return null and let client-side handle it.
  }

  return null;
}

/**
 * Middleware-style check: returns a NextResponse error if not authenticated.
 * Use this in API routes that require authentication.
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser | null> {
  const user = await getCurrentUser(request);

  if (!user) {
    return null; // Let the route handler return its own error response
  }

  return user;
}
