import { getApiBaseUrl } from "../api-base-url.mjs";
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
  maxAge: 15 * 60, // Seconds; match the backend access-token lifetime in config/jwt.js.
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // Seconds here; backend REFRESH_TOKEN_TTL_MS is expressed in milliseconds.
};

// Verify the token's signature and expiry with the server-only access secret.
// Missing or rejected tokens return null; this does not query account state.
export function verifyAccessToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch {
    return null;
  }
}

// Share only in-flight refresh promises for the same cookie in this Node
// process. Entries are removed after settlement; this is not a token cache
// or cross-instance coordination. The backend still controls token rotation.
// Relay its refresh cookie explicitly. Denied, malformed or unreachable
// responses resolve to null.
const inFlightRefreshes = new Map();

export async function refreshTokens(refreshToken) {
  if (!refreshToken) return null;

  if (inFlightRefreshes.has(refreshToken)) {
    return inFlightRefreshes.get(refreshToken);
  }

  const promise = (async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
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

// Map verified JWT claims into the application's session-user shape.
// These values are a token snapshot, not a live department/account lookup.
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
