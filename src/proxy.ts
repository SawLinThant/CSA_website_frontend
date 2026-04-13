import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, isLocale } from "./i18n/config";

const PUBLIC_FILE = /\.[^/]+$/;

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_SKEW_SECONDS = 60;

function envAccessName() {
  return process.env.AUTH_ACCESS_TOKEN_COOKIE_NAME ?? "accessToken";
}

function envRefreshName() {
  return process.env.AUTH_REFRESH_TOKEN_COOKIE_NAME ?? "refreshToken";
}

function envRememberMeName() {
  return process.env.AUTH_REMEMBER_ME_COOKIE_NAME ?? "rememberMe";
}

function apiBaseUrl() {
  return process.env.API_BASE_URL ?? "http://localhost:4000";
}

function cookieSecure() {
  return process.env.NODE_ENV === "production";
}

function cookieSameSite(): "lax" | "strict" | "none" {
  const v = process.env.COOKIE_SAMESITE;
  if (v === "strict" || v === "none" || v === "lax") return v;
  return "lax";
}

function jwtExpSeconds(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (b64.length % 4)) % 4;
    b64 += "=".repeat(pad);
    const json = JSON.parse(atob(b64)) as { exp?: unknown };
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

type CookieOp =
  | { kind: "delete"; name: string }
  | {
      kind: "set";
      name: string;
      value: string;
      options: {
        httpOnly: boolean;
        path: string;
        secure: boolean;
        sameSite: "lax" | "strict" | "none";
        maxAge?: number;
      };
    };

function applyCookieOps(res: NextResponse, ops: CookieOp[]) {
  for (const op of ops) {
    if (op.kind === "delete") {
      res.cookies.delete(op.name);
    } else {
      res.cookies.set(op.name, op.value, op.options);
    }
  }
}

/** Per-request CSP nonce so `script-src` can stay strict (no `'unsafe-inline'`). */
function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "connect-src 'self' https: http:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

async function computeSessionRefreshOps(request: NextRequest): Promise<CookieOp[]> {
  const ACCESS = envAccessName();
  const REFRESH = envRefreshName();
  const REMEMBER_ME = envRememberMeName();
  const refresh = request.cookies.get(REFRESH)?.value;
  if (!refresh) return [];
  const rememberMe = request.cookies.get(REMEMBER_ME)?.value !== "0";

  const access = request.cookies.get(ACCESS)?.value;
  const now = Math.floor(Date.now() / 1000);
  const exp = access ? jwtExpSeconds(access) : null;
  const needRefresh = !access || (exp != null && exp <= now + REFRESH_SKEW_SECONDS);
  if (!needRefresh) return [];

  const baseOpts = {
    httpOnly: true,
    path: "/",
    secure: cookieSecure(),
    sameSite: cookieSameSite(),
  } as const;

  try {
    const res = await fetch(`${apiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: "no-store",
    });

    if (!res.ok) {
      return [
        { kind: "delete", name: ACCESS },
        { kind: "delete", name: REFRESH },
      ];
    }

    const data = (await res.json()) as {
      accessToken?: unknown;
      refreshToken?: unknown;
    };

    if (typeof data.accessToken !== "string") {
      return [];
    }

    const nextRefresh =
      typeof data.refreshToken === "string" && data.refreshToken.length > 0
        ? data.refreshToken
        : refresh;

    return [
      {
        kind: "set",
        name: ACCESS,
        value: data.accessToken,
        options: { ...baseOpts, maxAge: ACCESS_MAX_AGE },
      },
      {
        kind: "set",
        name: REFRESH,
        value: nextRefresh,
        options: rememberMe ? { ...baseOpts, maxAge: 60 * 60 * 24 * 7 } : { ...baseOpts },
      },
      {
        kind: "set",
        name: REMEMBER_ME,
        value: rememberMe ? "1" : "0",
        options: rememberMe ? { ...baseOpts, maxAge: 60 * 60 * 24 * 7 } : { ...baseOpts },
      },
    ];
  } catch {
    return [];
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const nonce = process.env.NODE_ENV === "production" ? createNonce() : null;
  const requestHeaders = new Headers(request.headers);
  if (nonce) {
    requestHeaders.set("x-nonce", nonce);
  }

  const withCsp = (res: NextResponse) => {
    if (nonce) {
      res.headers.set("Content-Security-Policy", buildCsp(nonce));
    }
    return res;
  };

  const cookieOps = await computeSessionRefreshOps(request);

  if (pathname.startsWith("/api")) {
    const res = NextResponse.next(
      nonce ? { request: { headers: requestHeaders } } : undefined,
    );
    applyCookieOps(res, cookieOps);
    return res;
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (firstSegment && isLocale(firstSegment)) {
    const res = NextResponse.next(
      nonce ? { request: { headers: requestHeaders } } : undefined,
    );
    applyCookieOps(res, cookieOps);
    return withCsp(res);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  const redirect = NextResponse.redirect(url);
  applyCookieOps(redirect, cookieOps);
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
