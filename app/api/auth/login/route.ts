import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateTokenPair, getRefreshCookieOptions, JWT_COOKIE_NAME } from "@/app/lib/jwt";
import { db } from "@/src/prisma/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ── Validation ───────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();

    // ── Find user by email ───────────────────────────────────────
    const user = await db.orm.public.User.first({ email: emailTrimmed });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // ── Verify password ──────────────────────────────────────────
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // ── Generate tokens ──────────────────────────────────────────
    const tokens = await generateTokenPair(user.id, user.email, user.name ?? undefined);

    // ── Set refresh token cookie ─────────────────────────────────
    const cookieOptions = getRefreshCookieOptions();
    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: { id: user.id, email: user.email, name: user.name },
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
      { status: 200 }
    );

    response.cookies.set(JWT_COOKIE_NAME, tokens.refreshToken, cookieOptions);

    return response;
  } catch (error) {
    console.error("[auth/login] Error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
