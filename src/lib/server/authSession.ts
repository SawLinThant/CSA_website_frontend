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

async function setCookieValue(name: string, value: string, maxAgeSeconds?: number) {
  const store = await cookieStore();
  store.set({
    name,
    value,
    httpOnly: true,
    secure: cookieSecurity.secure,
    sameSite: env.COOKIE_SAMESITE,
    path: "/",
    ...(maxAgeSeconds !== undefined ? { maxAge: maxAgeSeconds } : {}),
  });
}

async function deleteCookieValue(name: string) {
  const store = await cookieStore();
  store.delete(name);
}

export async function clearAuthCookies() {
  await deleteCookieValue(env.AUTH_ACCESS_TOKEN_COOKIE_NAME);
  await deleteCookieValue(env.AUTH_REFRESH_TOKEN_COOKIE_NAME);
  await deleteCookieValue(env.AUTH_REMEMBER_ME_COOKIE_NAME);
}

/** Store tokens from login/register; refresh cookie uses session storage when rememberMe is false. */
export async function persistAuthTokens(
  accessToken: string,
  refreshToken: string,
  options?: { rememberMe?: boolean },
) {
  const rememberMe = options?.rememberMe ?? true;
  await setCookieValue(
    env.AUTH_ACCESS_TOKEN_COOKIE_NAME,
    accessToken,
    AUTH_ACCESS_COOKIE_MAX_AGE_SECONDS,
  );
  await setCookieValue(
    env.AUTH_REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    rememberMe ? AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS : undefined,
  );
  await setCookieValue(
    env.AUTH_REMEMBER_ME_COOKIE_NAME,
    rememberMe ? "1" : "0",
    rememberMe ? AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS : undefined,
  );
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
  const res = await fetch(`${env.API_BASE_URL}/auth/refresh`, {
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

/**
 * Sets auth cookies — only valid from a Server Action or Route Handler (not during RSC).
 * For normal navigations, refresh runs in `src/proxy.ts` before the app runs.
 */
export async function forceRefreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  const rememberMe = (await getCookieValue(env.AUTH_REMEMBER_ME_COOKIE_NAME)) !== "0";
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
    rememberMe ? AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS : undefined,
  );
  await setCookieValue(
    env.AUTH_REMEMBER_ME_COOKIE_NAME,
    rememberMe ? "1" : "0",
    rememberMe ? AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS : undefined,
  );

  return refreshed.accessToken;
}

