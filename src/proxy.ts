import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/signup", "/verify", "/auth/callback"];

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith("/auth/")
  );
  if (isPublicRoute) return NextResponse.next();

  const hasSessionCookie = request.cookies.getAll().some(
    ({ name }) => name.startsWith("sb-") && name.includes("-auth-token")
  );

  if (!hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
