import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("accessToken");

    const pathname = request.nextUrl.pathname;

    const isProtectedRoute = [
        "/command-center",
        "/dashboard",
        "/inbox",
        "/mail",
        "/calendar",
        "/agent",
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
            new URL("/command-center", request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/command-center/:path*",
        "/dashboard/:path*",
        "/inbox/:path*",
        "/mail/:path*",
        "/calendar/:path*",
        "/agent/:path*",
        "/assistant/:path*",
        "/settings/:path*",
        "/login",
        "/signup",
    ],
};
