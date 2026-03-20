import type { Product } from "../../domain/schemas";
import { productsApi } from "../../infrastructure/backend/productsApi";

export async function publicGetProductUseCase(productId: string): Promise<Product> {
  return productsApi.getPublicProduct(productId);
}

