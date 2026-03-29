import { NextResponse } from "next/server";
import { z } from "zod";
import { persistAuthTokens } from "@/lib/server/authSession";
import { normalizePhone, postBackendAuthJson } from "@/lib/server/backendAuthPost";

function optionalEmail(email: string | undefined) {
  const t = email?.trim();
  if (!t) return undefined;
  return t;
}

const customerRegisterSchema = z.object({
  role: z.literal("customer"),
  name: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().min(6),
  password: z.string().min(8),
  otp: z.string().regex(/^\d{6}$/),
  rememberMe: z.boolean().optional(),
});
const bodySchema = customerRegisterSchema;

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const rememberMe = data.rememberMe ?? true;

  const email = optionalEmail(data.email);
  const payload: Record<string, unknown> = {
    name: data.name,
    phone: normalizePhone(data.phone),
    password: data.password,
    otp: data.otp,
  };
  if (email) payload.email = email;

  const result = await postBackendAuthJson("/auth/customer/register", payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  await persistAuthTokens(result.data.accessToken, result.data.refreshToken, { rememberMe });
  return NextResponse.json({ user: result.data.user }, { status: 201 });
}
