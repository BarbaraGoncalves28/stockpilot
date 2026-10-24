import { apiFetch } from "../../api/client";

import type {
  Product,
  ProductListParams,
  ProductListResponse,
  UpdateProductInput,
} from "./product.types";

type ApiValidationError = {
  loc?: Array<string | number>;
  msg?: string;
};

function getApiErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data === "object" &&
    data !== null
  ) {
    const responseData = data as {
      message?: unknown;
      detail?: unknown;
    };

    if (
      typeof responseData.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }

    if (
      typeof responseData.detail === "string" &&
      responseData.detail.trim()
    ) {
      return responseData.detail;
    }

    if (Array.isArray(responseData.detail)) {
      const messages = responseData.detail
        .map((error: unknown) => {
          if (
            typeof error !== "object" ||
            error === null
          ) {
            return null;
          }

          const validationError =
            error as ApiValidationError;

          const field = Array.isArray(validationError.loc)
            ? validationError.loc[
                validationError.loc.length - 1
              ]
            : null;

          const message =
            typeof validationError.msg === "string"
              ? validationError.msg
              : "Valor inválido.";

          if (field) {
            return `${String(field)}: ${message}`;
          }

          return message;
        })
        .filter(
          (message): message is string =>
            Boolean(message),
        );

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }
  }

  return fallback;
}

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

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        data,
        "Não foi possível carregar os produtos.",
      ),
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

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        data,
        "Não foi possível carregar o produto.",
      ),
    );
  }

  return data as Product;
}

export type CreateProductInput = {
  name: string;
  sku?: string;
  description?: string;
  category_id: number;
  supplier_id: number;
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
  const response = await apiFetch(
    "/products",
    {
      method: "POST",
      accessToken,
      body: JSON.stringify(input),
    },
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        data,
        "Não foi possível cadastrar o produto.",
      ),
    );
  }

  return data as Product;
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

  const result: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        result,
        "Não foi possível atualizar o produto.",
      ),
    );
  }

  return result as Product;
}

export async function deleteProduct(
  accessToken: string,
  productId: number,
): Promise<void> {
  const response = await apiFetch(
    `/products/${productId}`,
    {
      method: "DELETE",
      accessToken,
    },
  );

  if(!response.ok) {
    let data: unknown = null;

    try {
      data = await response.json();
    } catch {

    }

    throw new Error(
      getApiErrorMessage(
        data,
        "Não foi possível desativar o produto",
      ),
    );
  }
}

export async function restoreProduct(
  accessToken: string,
  productId: number,
): Promise<Product> {
  const response = await apiFetch(
    `/products/${productId}/restore`,
    {
      method: "PATCH",
      accessToken,
    },
  );

  const data: unknown = await response.json();

  if(!response.ok) {
    throw new Error(
      getApiErrorMessage(
        data,
        "Não foi possível restaurar o produto.",
      ),
    );
  }

  return data as Product;
}