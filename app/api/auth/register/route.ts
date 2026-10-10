import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateTokenPair, getRefreshCookieOptions, JWT_COOKIE_NAME } from "@/app/lib/jwt";
import { db } from "@/src/prisma/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // ── Validation ───────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // ── Check if user already exists ─────────────────────────────
    const existingUser = await db.orm.public.User.first({ email: emailTrimmed });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ── Create user ──────────────────────────────────────────────
    const passwordHash = await hashPassword(password);

    const newUser = await db.orm.public.User.create({
      email: emailTrimmed,
      passwordHash,
      name: name?.trim() || null,
    });

    // ── Generate tokens ──────────────────────────────────────────
    const tokens = await generateTokenPair(newUser.id, newUser.email, newUser.name ?? undefined);

    // ── Set refresh token cookie ─────────────────────────────────
    const cookieOptions = getRefreshCookieOptions();
    const response = NextResponse.json(
      {
        message: "Registration successful.",
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
      { status: 201 }
    );

    response.cookies.set(JWT_COOKIE_NAME, tokens.refreshToken, cookieOptions);

    return response;
  } catch (error) {
    console.error("[auth/register] Error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
