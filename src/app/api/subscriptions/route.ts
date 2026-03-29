import { NextResponse } from "next/server";
import { z } from "zod";
import { authApi } from "@/features/auth/infrastructure/backend/authApi";
import { backendPostJson, isBackendRequestError } from "@/lib/server/backendClient";

const bodySchema = z.object({
  planId: z.string().min(1),
  startDate: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    console.error("[website][subscribe] invalid input", {
      input: json,
      issues: parsed.error.issues,
    });
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const me = await authApi.getMe();
    console.log("[website][subscribe] request received", {
      userId: me.user.id,
      role: me.user.role,
      planId: parsed.data.planId,
      startDate: parsed.data.startDate ?? null,
    });
    if (me.user.role !== "customer") {
      console.error("[website][subscribe] forbidden role", {
        userId: me.user.id,
        role: me.user.role,
        planId: parsed.data.planId,
      });
      return NextResponse.json({ error: "Only customers can subscribe." }, { status: 403 });
    }

    const payload = await backendPostJson<{ planId: string; startDate?: string }, unknown>(
      "/auth/customer/subscriptions",
      {
        planId: parsed.data.planId,
        ...(parsed.data.startDate ? { startDate: parsed.data.startDate } : {}),
      },
      { requiresAuth: true },
    );

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    if (isBackendRequestError(error)) {
      console.error("[website][subscribe] backend request error", {
        status: error.status,
        statusText: error.statusText,
        path: error.path,
        message: error.message,
        payload: error.payload,
        planId: parsed.data.planId,
        startDate: parsed.data.startDate ?? null,
      });
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Subscription failed";
    console.error("[website][subscribe] unexpected error", {
      message,
      planId: parsed.data.planId,
      startDate: parsed.data.startDate ?? null,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

