import type { BoxListResponse, PublicListBoxesQuery } from "../../domain/schemas";
import { boxesApi } from "../../infrastructure/backend/boxesApi";

export async function listPublicBoxesUseCase(query: PublicListBoxesQuery): Promise<BoxListResponse> {
  return boxesApi.listPublicBoxes(query);
}

