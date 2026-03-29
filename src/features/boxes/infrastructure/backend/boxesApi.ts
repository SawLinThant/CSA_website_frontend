import { backendGetJson } from "@/lib/server/backendClient";
import {
  type Box,
  boxDetailResponseSchema,
  boxListResponseSchema,
  boxSchema,
  type BoxDetailResponse,
  type BoxListResponse,
  type PublicListBoxesQuery,
} from "../../domain/schemas";

export const boxesApi = {
  async listPublicBoxes(query: PublicListBoxesQuery): Promise<BoxListResponse> {
    const data = await backendGetJson<unknown>("/api/boxes", query as Record<string, string | number | boolean | undefined>, {
      requiresAuth: false,
      revalidate: 60,
    });
    return boxListResponseSchema.parse(data);
  },

  async getPublicBox(id: string): Promise<Box> {
    const data = await backendGetJson<unknown>(`/api/boxes/${id}`, undefined, {
      requiresAuth: false,
      revalidate: 60,
    });
    return boxSchema.parse(data);
  },

  async getPublicBoxDetail(id: string): Promise<BoxDetailResponse> {
    const data = await backendGetJson<unknown>(`/api/boxes/${id}/detail`, undefined, {
      requiresAuth: false,
      revalidate: 60,
    });
    return boxDetailResponseSchema.parse(data);
  },
};

