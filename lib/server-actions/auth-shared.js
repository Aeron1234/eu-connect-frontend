import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET must be set in the environment");
}

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const isProd = process.env.NODE_ENV === "production";

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60, // seconds — keep in sync with ACCESS_TOKEN_TTL in Express lib/jwt.js
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // seconds — keep in sync with REFRESH_TOKEN_TTL_MS
};

// Verifies signature + expiry. Returns the decoded payload, or null if
// missing/expired/tampered. Safe to call from proxy.js now that it runs on
// the Node runtime (jsonwebtoken doesn't work on the Edge runtime).
export function verifyAccessToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch {
    return null;
  }
}

// Calls Express's /auth/refresh, relaying the refresh cookie manually since
// this is a server-to-server call with no browser cookie jar attached.
// Returns the new token pair, or null if the refresh itself failed
// (expired, revoked, or reuse detected).
const inFlightRefreshes = new Map();

export async function refreshTokens(refreshToken) {
  if (!refreshToken) return null;

  if (inFlightRefreshes.has(refreshToken)) {
    return inFlightRefreshes.get(refreshToken);
  }

  const promise = (async () => {
    try {
      const res = await fetch(`${process.env.API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
        },
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (!data.accessToken || !data.refreshToken) return null;

      return { accessToken: data.accessToken, refreshToken: data.refreshToken };
    } catch {
      return null;
    }
  })();

  inFlightRefreshes.set(refreshToken, promise);

  try {
    return await promise;
  } finally {
    inFlightRefreshes.delete(refreshToken);
  }
}

// Turns a decoded JWT payload into the session-user shape used throughout
// the app (matches what NextAuth's session.user used to look like).
export function payloadToUser(payload) {
  return {
    id: payload.sub,
    username: payload.username,
    role: payload.role,
    course_id: payload.course_id ?? null,
    course_name: payload.course_name ?? null,
    department_id: payload.department_id ?? null,
    department_code: payload.department_code ?? null,
  };
}
