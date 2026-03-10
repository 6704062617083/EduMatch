import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const role = request.cookies.get("role")?.value;
  const path = request.nextUrl.pathname;

  if (!role && path.startsWith("/home")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/home/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/home/tutor") && role !== "tutor") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/home/student") && role !== "student") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/home/:path*"],
};