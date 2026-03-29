import type { BoxDetailResponse } from "../../domain/schemas";
import { boxesApi } from "../../infrastructure/backend/boxesApi";

export async function getPublicBoxDetailUseCase(boxId: string): Promise<BoxDetailResponse> {
  return boxesApi.getPublicBoxDetail(boxId);
}
