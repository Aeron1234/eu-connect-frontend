"use server";

import { cookies } from "next/headers";
import { cache } from "react";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
  verifyAccessToken,
  refreshTokens,
  payloadToUser,
} from "./auth-shared";

// ---- cookie helpers --------------------------------------------------------

// Cookies can only be mutated in a Server Action or Route Handler — NOT in
// a Server Component render. getUserSession() gets called from both, so
// every write here is wrapped in try/catch and fails silently when called
// from a read-only render context. That's fine: in that case, proxy.js
// already refreshed and set fresh cookies before this request ever reached
// the component, so there's nothing this call would have needed to persist.
async function trySetAuthCookies(tokens) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, tokens.accessToken, accessCookieOptions);
    cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions);
  } catch {
    // Read-only context (Server Component render) — safe to ignore.
  }
}

async function tryClearAuthCookies() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);
  } catch {
    // Read-only context — safe to ignore.
  }
}

// ---- public API -------------------------------------------------------------

// Matches the shape NextAuth's session.user used to have, so most existing
// call sites (session.user.id, session.user.role, etc.) don't need changes.
// Self-healing: if the access token is expired but the refresh token is
// still valid, this transparently refreshes and persists new cookies
// (when called somewhere cookies can be written) before returning the user.
export const getUserSession = cache(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  let payload = verifyAccessToken(accessToken);

  if (!payload) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) return null;

    const newTokens = await refreshTokens(refreshToken);
    if (!newTokens) {
      await tryClearAuthCookies();
      return null;
    }

    payload = verifyAccessToken(newTokens.accessToken);
    if (!payload) return null; // shouldn't happen, but don't trust a bad token

    await trySetAuthCookies(newTokens);
  }

  return { user: payloadToUser(payload) };
});

// Server actions and route handlers calling the Express API need the raw
// token string to send as an Authorization header. Self-healing like
// getUserSession() — refreshes and persists new cookies if the current
// access token is dead, so callers always get back a token that's
// actually valid to use right now (or null if the whole session is gone).
export async function getAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (verifyAccessToken(accessToken)) {
    return accessToken;
  }

  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const newTokens = await refreshTokens(refreshToken);
  if (!newTokens) {
    await tryClearAuthCookies();
    return null;
  }

  await trySetAuthCookies(newTokens);
  return newTokens.accessToken;
}
