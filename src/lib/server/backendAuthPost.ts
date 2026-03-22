import { env } from "./env";

export function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: unknown;
};

export async function postBackendAuthJson(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: AuthTokensResponse } | { ok: false; status: number; error: string }> {
  const res = await fetch(`${env.API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    let err = "Request failed";
    if (typeof data.error === "string") err = data.error;
    else if (typeof data.message === "string") err = data.message;
    return { ok: false, status: res.status, error: err };
  }

  const accessToken = data.accessToken;
  const refreshToken = data.refreshToken;
  if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
    return { ok: false, status: 502, error: "Invalid response from server" };
  }

  return { ok: true, data: { accessToken, refreshToken, user: data.user } };
}
