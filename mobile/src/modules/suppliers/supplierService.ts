import { apiFetch } from "../../api/client";

import type {
  CreateSupplierInput,
  Supplier,
  SupplierListParams,
  SupplierListResponse,
  UpdateSupplierInput,
} from "./supplier.types";

export async function getSuppliers(
  accessToken: string,
  params: SupplierListParams = {},
): Promise<SupplierListResponse> {
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
    `/suppliers?${searchParams.toString()}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar os fornecedores.",
    );
  }

  return data as SupplierListResponse;
}

export async function getSupplier(
  accessToken: string,
  supplierId: number,
): Promise<Supplier> {
  const response = await apiFetch(
    `/suppliers/${supplierId}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar o fornecedor.",
    );
  }

  return data as Supplier;
}

export async function createSupplier(
  accessToken: string,
  input: CreateSupplierInput,
): Promise<Supplier> {
  const response = await apiFetch("/suppliers", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível cadastrar o fornecedor.",
    );
  }

  return data as Supplier;
}

export async function updateSupplier(
  accessToken: string,
  supplierId: number,
  input: UpdateSupplierInput,
): Promise<Supplier> {
  const response = await apiFetch(
    `/suppliers/${supplierId}`,
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
        "Não foi possível atualizar o fornecedor.",
    );
  }

  return data as Supplier;
}

export async function deleteSupplier(
  accessToken: string,
  supplierId: number,
): Promise<void> {
  const response = await apiFetch(
    `/suppliers/${supplierId}`,
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
        "Não foi possível excluir o fornecedor.",
    );
  }
}

export async function restoreSupplier(
  accessToken: string,
  supplierId: number,
): Promise<Supplier> {
  const response = await apiFetch(
    `/suppliers/${supplierId}/restore`,
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
        "Não foi possível restaurar o fornecedor.",
    );
  }

  return data as Supplier;
}