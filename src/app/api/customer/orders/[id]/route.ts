import { NextResponse } from "next/server";
import { backendGetJson, isBackendRequestError } from "@/lib/server/backendClient";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Order id required" }, { status: 400 });
  }

  try {
    const data = await backendGetJson<unknown>(`/auth/customer/orders/${encodeURIComponent(id)}`, undefined, {
      requiresAuth: true,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (isBackendRequestError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Failed to load order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
