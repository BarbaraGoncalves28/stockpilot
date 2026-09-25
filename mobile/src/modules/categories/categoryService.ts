import { apiFetch } from "../../api/client";

import type {
  Category,
  CategoryListParams,
  CategoryListResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.types";

export async function getCategories(
  accessToken: string,
  params: CategoryListParams = {},
): Promise<CategoryListResponse> {
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

  if (params.isActive !== undefined) {
    searchParams.set(
      "is_active",
      String(params.isActive),
    );
  }

  const response = await apiFetch(
    `/categories?${searchParams.toString()}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar as categorias.",
    );
  }

  return data as CategoryListResponse;
}

export async function getCategory(
  accessToken: string,
  categoryId: number,
): Promise<Category> {
  const response = await apiFetch(
    `/categories/${categoryId}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar a categoria.",
    );
  }

  return data as Category;
}

export async function createCategory(
  accessToken: string,
  input: CreateCategoryInput,
): Promise<Category> {
  const response = await apiFetch("/categories", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível cadastrar a categoria.",
    );
  }

  return data as Category;
}

export async function updateCategory(
  accessToken: string,
  categoryId: number,
  input: UpdateCategoryInput,
): Promise<Category> {
  const response = await apiFetch(
    `/categories/${categoryId}`,
    {
      method: "PATCH",
      accessToken,
      body: JSON.stringify(input),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível atualizar a categoria.",
    );
  }

  return data as Category;
}

export async function deleteCategory(
  accessToken: string,
  categoryId: number,
): Promise<void> {
  const response = await apiFetch(
    `/categories/${categoryId}`,
    {
      method: "DELETE",
      accessToken,
    },
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível excluir a categoria.",
    );
  }
}

export async function restoreCategory(
  accessToken: string,
  categoryId: number,
): Promise<Category> {
  const response = await apiFetch(
    `/categories/${categoryId}/restore`,
    {
      method: "PATCH",
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível restaurar a categoria.",
    );
  }

  return data as Category;
}