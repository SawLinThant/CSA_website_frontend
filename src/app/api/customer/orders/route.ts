import { NextResponse } from "next/server";
import { backendGetJson, isBackendRequestError } from "@/lib/server/backendClient";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query: Record<string, string | number | undefined> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (value === "") continue;
    const numKeys = new Set(["page", "limit"]);
    if (numKeys.has(key)) {
      const n = Number(value);
      if (!Number.isNaN(n)) query[key] = n;
    } else {
      query[key] = value;
    }
  }

  try {
    const data = await backendGetJson<unknown>("/auth/customer/orders", query, { requiresAuth: true });
    return NextResponse.json(data);
  } catch (error) {
    if (isBackendRequestError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Failed to load orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
