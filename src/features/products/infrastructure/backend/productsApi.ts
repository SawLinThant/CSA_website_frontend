import { backendGetJson } from "@/lib/server/backendClient";
import {
  publicProductListResponseSchema,
  publicListProductsQuerySchema,
  type PublicProductListResponse,
  type PublicListProductsQuery,
  productSchema,
  type Product,
} from "../../domain/schemas";

export const productsApi = {
  async listPublicProducts(query: PublicListProductsQuery): Promise<PublicProductListResponse> {
    const data = await backendGetJson<unknown>("/api/products", query as Record<string, string | number | boolean | undefined>, {
      requiresAuth: false,
      revalidate: 60,
    });
    return publicProductListResponseSchema.parse(data);
  },

  async getPublicProduct(productId: string): Promise<Product> {
    const data = await backendGetJson<unknown>(`/api/products/${productId}`, undefined, {
      requiresAuth: false,
      revalidate: 60,
    });
    return productSchema.parse(data);
  },
};

export function parsePublicListProductsQuery(input: unknown): PublicListProductsQuery {
  return publicListProductsQuerySchema.parse(input);
}

