import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken, signAccessToken, JWT_COOKIE_NAME } from "@/app/lib/jwt";
import { db } from "@/src/prisma/db";

export async function POST() {
  try {
    // ── Get refresh token from cookie ────────────────────────────
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(JWT_COOKIE_NAME)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token provided." },
        { status: 401 }
      );
    }

    // ── Verify refresh token ─────────────────────────────────────
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token." },
        { status: 401 }
      );
    }

    // ── Fetch user to get current data ───────────────────────────
    const userId = Number(payload.sub);
    const user = await db.orm.public.User.first({ id: userId });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // ── Generate new access token (refresh token stays the same) ─
    const accessToken = await signAccessToken({
      sub: String(user.id),
      email: user.email,
      name: user.name ?? undefined,
    });

    return NextResponse.json(
      {
        accessToken,
        expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || "900", 10),
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[auth/refresh] Error:", error);
    return NextResponse.json(
      { error: "Token refresh failed." },
      { status: 500 }
    );
  }
}
