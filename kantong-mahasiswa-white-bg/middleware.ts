import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session_token";

// Route yang butuh login
const PROTECTED_PREFIXES = ["/dashboard", "/transaksi"];

// Route yang hanya boleh diakses kalau BELUM login
const AUTH_ONLY_PREFIXES = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transaksi/:path*", "/auth/:path*"],
};
