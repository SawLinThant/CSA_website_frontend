import type { MeResponse } from "../../domain/schemas";
import { authApi } from "../../infrastructure/backend/authApi";

export async function getMeUseCase(): Promise<MeResponse["user"]> {
  const data = await authApi.getMe();
  return data.user;
}

