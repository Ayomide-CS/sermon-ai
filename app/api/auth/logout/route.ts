import { NextResponse } from "next/server";
import { JWT_COOKIE_NAME, getRefreshCookieOptions } from "@/app/lib/jwt";

export async function POST() {
  try {
    const cookieOptions = getRefreshCookieOptions();

    // Clear the refresh token cookie by setting maxAge to 0
    const response = NextResponse.json(
      { message: "Logged out successfully." },
      { status: 200 }
    );

    response.cookies.set(JWT_COOKIE_NAME, "", {
      ...cookieOptions,
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error("[auth/logout] Error:", error);
    return NextResponse.json(
      { error: "Logout failed." },
      { status: 500 }
    );
  }
}
