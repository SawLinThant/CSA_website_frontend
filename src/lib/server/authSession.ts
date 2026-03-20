import { cookies } from "next/headers";
import { z } from "zod";
import { env, cookieSecurity } from "./env";

const AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // backend: 7d refresh token
const AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 15; // backend: 15m access token

const refreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  user: z.unknown().optional(),
});

function cookieStore() {
  // `cookies()` can only be called in server modules.
  // In this Next.js version, the type is async.
  return cookies();
}

async function getCookieValue(name: string): Promise<string | null> {
  const store = await cookieStore();
  const v = store.get(name)?.value;
  if (!v) return null;
  return v;
}

async function setCookieValue(name: string, value: string, maxAgeSeconds: number) {
  const store = await cookieStore();
  store.set({
    name,
    value,
    httpOnly: true,
    secure: cookieSecurity.secure,
    sameSite: env.COOKIE_SAMESITE,
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

async function deleteCookieValue(name: string) {
  const store = await cookieStore();
  store.delete(name);
}

async function clearAuthCookies() {
  await deleteCookieValue(env.AUTH_ACCESS_TOKEN_COOKIE_NAME);
  await deleteCookieValue(env.AUTH_REFRESH_TOKEN_COOKIE_NAME);
}

export async function getRefreshToken(): Promise<string | null> {
  return getCookieValue(env.AUTH_REFRESH_TOKEN_COOKIE_NAME);
}

export async function getAccessToken(): Promise<string | null> {
  return getCookieValue(env.AUTH_ACCESS_TOKEN_COOKIE_NAME);
}

async function refreshTokensFromBackend(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
} | null> {
  const res = await fetch(env.API_BASE_URL + "/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
    credentials: "omit",
  });

  if (!res.ok) return null;

  const json = (await res.json().catch(() => undefined)) as unknown;
  const parsed = refreshResponseSchema.safeParse(json);
  if (!parsed.success) return null;

  return {
    accessToken: parsed.data.accessToken,
    refreshToken: parsed.data.refreshToken ?? null,
  };
}

// Refresh-on-demand (used by backend client retry-on-401).
export async function forceRefreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearAuthCookies();
    return null;
  }

  const refreshed = await refreshTokensFromBackend(refreshToken);
  if (!refreshed) {
    // Refresh failed => tokens are invalid; clear session cookies.
    await clearAuthCookies();
    return null;
  }

  await setCookieValue(
    env.AUTH_ACCESS_TOKEN_COOKIE_NAME,
    refreshed.accessToken,
    AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS,
  );

  // Some backends may return the same refresh token; keep whichever is provided.
  const nextRefreshToken = refreshed.refreshToken ?? refreshToken;
  await setCookieValue(
    env.AUTH_REFRESH_TOKEN_COOKIE_NAME,
    nextRefreshToken,
    AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS,
  );

  return refreshed.accessToken;
}

