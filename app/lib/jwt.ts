import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Configuration — read from environment variables
// ---------------------------------------------------------------------------

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = parseInt(process.env.JWT_ACCESS_EXPIRES_IN || "900", 10); // 15 min default
const REFRESH_EXPIRES_IN = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "604800", 10); // 7 days default

if (!ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET environment variable is required");
}
if (!REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is required");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JWTPayload {
  sub: string;       // user id (JWT spec requires string)
  email: string;
  name?: string;
  type: "access" | "refresh";
  jti: string;       // unique token id for refresh rotation
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
}

// ---------------------------------------------------------------------------
// Password Hashing
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 12;

/** Hash a plain-text password */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** Verify a plain-text password against a hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// Access Token (short-lived)
// ---------------------------------------------------------------------------

const accessKey = new TextEncoder().encode(ACCESS_SECRET);

/** Sign an access token */
export async function signAccessToken(payload: Omit<JWTPayload, "type" | "jti">): Promise<string> {
  const jti = crypto.randomUUID();
  return new SignJWT({ ...payload, type: "access" as const, jti })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setSubject(String(payload.sub))
    .setExpirationTime(`${ACCESS_EXPIRES_IN}s`)
    .sign(accessKey);
}

/** Verify and decode an access token */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessKey);
    if (payload.type !== "access") return null;
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Refresh Token (long-lived)
// ---------------------------------------------------------------------------

const refreshKey = new TextEncoder().encode(REFRESH_SECRET);

/** Sign a refresh token */
export async function signRefreshToken(userId: number): Promise<string> {
  const jti = crypto.randomUUID();
  return new SignJWT({ sub: String(userId), type: "refresh" as const, jti })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setSubject(String(userId))
    .setExpirationTime(`${REFRESH_EXPIRES_IN}s`)
    .sign(refreshKey);
}

/** Verify and decode a refresh token */
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshKey);
    if (payload.type !== "refresh") return null;
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Token Pair Generation
// ---------------------------------------------------------------------------

/** Generate both access and refresh tokens for a user */
export async function generateTokenPair(userId: number, email: string, name?: string): Promise<TokenPair> {
  const accessToken = await signAccessToken({ sub: String(userId), email, name });
  const refreshToken = await signRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_EXPIRES_IN,
  };
}

// ---------------------------------------------------------------------------
// Cookie Helpers (for refresh token httpOnly cookie)
// ---------------------------------------------------------------------------

export function getRefreshCookieOptions(): Record<string, string | boolean | number> {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction || process.env.JWT_COOKIE_SECURE === "true",
    sameSite: (process.env.JWT_COOKIE_SAME_SITE || "lax") as "lax" | "strict" | "none",
    path: "/",
    maxAge: REFRESH_EXPIRES_IN, // seconds — matches token expiry
  };
}

export const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || "sermon_ai_refresh_token";
