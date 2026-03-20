import { z } from "zod";
import { env } from "./env";
import { forceRefreshAccessToken, getAccessToken } from "./authSession";

export type ApiErrorPayload = {
  error?: string;
  details?: unknown;
  message?: string;
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(env.API_BASE_URL + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseJsonSafe<T>(response: Response): Promise<T | undefined> {
  try {
    // Backend always returns JSON for errors; still guard against non-JSON.
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

type BackendRequestOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  body?: JsonValue;
  requiresAuth?: boolean;
  cache?: RequestCache;
  // Next.js caching controls.
  revalidate?: number;
  tags?: string[];
};

export async function backendRequestJson<TResponse>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  options: BackendRequestOptions = {},
): Promise<TResponse> {
  const url = buildUrl(path, options.query);

  async function doRequest(accessToken?: string | null) {
    const headers: Record<string, string> = {};

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      // Protected endpoints must never be cached.
      cache: options.requiresAuth ? "no-store" : options.revalidate !== undefined ? "force-cache" : options.cache,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      // Credentials are not used (tokens are in cookies + Authorization header),
      // but setting it explicitly keeps behavior predictable across environments.
      credentials: "omit",
      next:
        !options.requiresAuth && (options.revalidate !== undefined || options.tags?.length)
          ? { revalidate: options.revalidate, tags: options.tags }
          : undefined,
    });

    return res;
  }

  let accessToken: string | null = null;
  if (options.requiresAuth) {
    accessToken = await getAccessToken();
  }

  let response = await doRequest(accessToken);

  // Refresh-on-demand: if access token is present but expired/invalid, force refresh once.
  if (response.status === 401 && options.requiresAuth) {
    const refreshed = await forceRefreshAccessToken();
    if (refreshed) {
      response = await doRequest(refreshed);
    }
  }

  const json = await parseJsonSafe<unknown>(response);

  if (!response.ok) {
    const payload = (json ?? {}) as ApiErrorPayload;
    const message =
      payload.error ??
      payload.message ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  // Optional runtime validation to catch backend contract drift.
  // If you pass a non-JSON response, this will throw (intentional).
  if (json === undefined) {
    // For 204 responses, callers should use a different function; keep this strict.
    throw new Error("Expected JSON response, got empty body");
  }

  return z.unknown().parse(json) as TResponse;
}

export async function backendGetJson<TResponse>(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
  options?: Omit<BackendRequestOptions, "query" | "body" | "requiresAuth"> & { requiresAuth?: boolean },
): Promise<TResponse> {
  return backendRequestJson<TResponse>("GET", path, {
    query,
    requiresAuth: options?.requiresAuth,
    cache: options?.cache,
    revalidate: options?.revalidate,
    tags: options?.tags,
  });
}

export async function backendPostJson<TRequest, TResponse>(
  path: string,
  body?: TRequest,
  options?: Omit<BackendRequestOptions, "query" | "body" | "requiresAuth"> & { requiresAuth?: boolean },
): Promise<TResponse> {
  return backendRequestJson<TResponse>("POST", path, {
    body: body as unknown as JsonValue,
    requiresAuth: options?.requiresAuth,
    cache: options?.cache,
    revalidate: options?.revalidate,
    tags: options?.tags,
  });
}

