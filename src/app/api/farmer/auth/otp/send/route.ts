import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/server/env";
import { normalizePhone } from "@/lib/server/backendAuthPost";

const bodySchema = z.object({
  phone: z.string().min(6),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const res = await fetch(`${env.API_BASE_URL}/auth/farmer/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: normalizePhone(parsed.data.phone) }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    let err = "Request failed";
    if (typeof data.error === "string") err = data.error;
    else if (typeof data.message === "string") err = data.message;
    return NextResponse.json({ error: err }, { status: res.status });
  }

  return NextResponse.json(data);
}
