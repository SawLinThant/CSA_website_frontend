import { authApi } from "@/features/auth/infrastructure/backend/authApi";
import { getAccessToken } from "@/lib/server/authSession";
import type { UserRole } from "@/features/auth/domain/schemas";

export type ShellAuthState =
  | { status: "guest" }
  | { status: "authenticated"; user: { id: string; role: UserRole } };

/** For shell UI (header): valid access/refresh session and /auth/me succeeds. */
export async function getShellAuthState(): Promise<ShellAuthState> {
  const token = await getAccessToken();
  if (!token) {
    return { status: "guest" };
  }
  try {
    const me = await authApi.getMe();
    return { status: "authenticated", user: me.user };
  } catch {
    return { status: "guest" };
  }
}
