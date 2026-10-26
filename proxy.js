// Page-session boundary; layouts and backend routes apply their own role/record checks.
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
  verifyAccessToken,
  refreshTokens,
} from "@/lib/server-actions/auth-shared";

const PUBLIC_EXACT_PATHS = ["/"];
const PUBLIC_PREFIX_PATHS = ["/login", "/forgot-password"];

function isPublicPath(pathname) {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIX_PATHS.some((path) => pathname.startsWith(path));
}

function redirectToLogin(request) {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

// Authenticate matched page requests. Public path prefixes bypass this gate;
// missing credentials or a failed refresh redirect to login and clear cookies.
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  console.log("[proxy] hit:", pathname, new Date().toISOString());

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const payload = verifyAccessToken(accessToken);

  if (payload) {
    return NextResponse.next();
  }

  if (!refreshToken) {
    return redirectToLogin(request);
  }

  const newTokens = await refreshTokens(refreshToken);

  if (!newTokens) {
    return redirectToLogin(request);
  }

  // Attach the rotated pair to the outgoing response for the browser to keep.
  const response = NextResponse.next();
  response.cookies.set(
    ACCESS_COOKIE,
    newTokens.accessToken,
    accessCookieOptions,
  );
  response.cookies.set(
    REFRESH_COOKIE,
    newTokens.refreshToken,
    refreshCookieOptions,
  );

  return response;
}

// API handlers are outside this matcher and must authenticate their own requests.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
