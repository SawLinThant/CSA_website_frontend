import { backendGetJson } from "@/lib/server/backendClient";
import { meResponseSchema, type MeResponse } from "../../domain/schemas";

export const authApi = {
  async getMe(): Promise<MeResponse> {
    const data = await backendGetJson<unknown>("/me", undefined, { requiresAuth: true });
    return meResponseSchema.parse(data);
  },
};

