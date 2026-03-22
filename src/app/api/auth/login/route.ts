import { NextResponse } from "next/server";
import { z } from "zod";
import { persistAuthTokens } from "@/lib/server/authSession";
import { normalizePhone, postBackendAuthJson } from "@/lib/server/backendAuthPost";

const bodySchema = z.object({
  role: z.enum(["customer", "farmer"]),
  phone: z.string().min(6),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { role, phone, password, rememberMe } = parsed.data;
  const path = role === "customer" ? "/auth/customer/login" : "/auth/farmer/login";
  const result = await postBackendAuthJson(path, {
    phone: normalizePhone(phone),
    password,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await persistAuthTokens(result.data.accessToken, result.data.refreshToken, {
    rememberMe: rememberMe ?? true,
  });

  return NextResponse.json({ user: result.data.user });
}
