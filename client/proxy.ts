import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken");

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = [
    "/dashboard",
    "/inbox",
    "/calendar",
    "/assistant",
    "/settings",
  ].some((route) => pathname.startsWith(route));

  const isAuthRoute = [
    "/login",
    "/signup",
  ].some((route) => pathname.startsWith(route));

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inbox/:path*",
    "/calendar/:path*",
    "/assistant/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};