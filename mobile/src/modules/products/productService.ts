import { apiFetch } from "../../api/client";

import type {
  Product,
  ProductListParams,
  ProductListResponse,
  UpdateProductInput,
} from "./product.types";

export async function getProducts(
  accessToken: string,
  params: ProductListParams = {},
): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set(
    "page",
    String(params.page ?? 1),
  );

  searchParams.set(
    "page_size",
    String(params.pageSize ?? 20),
  );

  if (params.search?.trim()) {
    searchParams.set(
      "search",
      params.search.trim(),
    );
  }

  if (params.categoryId !== undefined) {
    searchParams.set(
      "category_id",
      String(params.categoryId),
    );
  }

  if (params.supplierId !== undefined) {
    searchParams.set(
      "supplier_id",
      String(params.supplierId),
    );
  }

  if (params.isActive !== undefined) {
    searchParams.set(
      "is_active",
      String(params.isActive),
    );
  }

  const response = await apiFetch(
    `/products?${searchParams.toString()}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "Não foi possível carregar os produtos.",
    );
  }

  return data as ProductListResponse;
}

export async function getProduct(
  accessToken: string,
  productId: number,
): Promise<Product> {
  const response = await apiFetch(
    `/products/${productId}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "Não foi possível carregar o produto.",
    );
  }

  return data as Product;
}

export type CreateProductInput = {
    name: string;
    sku: string;
    description?: string;
    category_id: number;
    supplier_id?: number;
    cost_price: string;
    sale_price: string;
    current_stock?: string;
    min_stock: string;
    max_stock?: string;
    unit: string;
};

export async function createProduct(
    accessToken: string,
    input: CreateProductInput,
): Promise<Product> {
    const response = await apiFetch("/products", {
        method: "POST",
        accessToken,
        body: JSON.stringify(input),
    });
    
    const data = await response.json();

    if(!response.ok) {
        throw new Error(
            data.message ??
            "Não foi possível cadastrar o produto.",
        );
    }

    return data as Product
}

export async function updateProduct(
  accessToken: string,
  productId: number,
  data: UpdateProductInput,
): Promise<Product> {
  const response = await apiFetch(
    `/products/${productId}`,
    {
      method: "PATCH",
      accessToken,
      body: JSON.stringify(data),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ??
      result.detail ??
      "Não foi possível atualizar o produto.",
    );
  }

  return result as Product;
}