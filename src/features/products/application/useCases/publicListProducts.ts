import type { PublicListProductsQuery, PublicProductListResponse } from "../../domain/schemas";
import { productsApi } from "../../infrastructure/backend/productsApi";

export async function publicListProductsUseCase(
  query: PublicListProductsQuery,
): Promise<PublicProductListResponse> {
  return productsApi.listPublicProducts(query);
}

