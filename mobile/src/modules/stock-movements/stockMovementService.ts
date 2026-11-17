import { apiFetch } from "../../api/client";

import type {
  CreateStockMovementInput,
  StockMovement,
  StockMovementListParams,
  StockMovementListResponse,
} from "./stockMovement.types";

export async function getStockMovements(
  accessToken: string,
  params: StockMovementListParams = {},
): Promise<StockMovementListResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set(
    "page",
    String(params.page ?? 1),
  );

  searchParams.set(
    "page_size",
    String(params.pageSize ?? 20),
  );

  if (params.productId) {
    searchParams.set(
      "product_id",
      String(params.productId),
    );
  }

  if (params.movementType) {
    searchParams.set(
      "movement_type",
      params.movementType,
    );
  }

  if (params.startDate) {
    searchParams.set(
      "start_date",
      params.startDate,
    );
  }

  if (params.endDate) {
    searchParams.set(
      "end_date",
      params.endDate,
    );
  }

  const response = await apiFetch(
    `/stock-movements?${searchParams.toString()}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar as movimentações.",
    );
  }

  return data as StockMovementListResponse;
}

export async function getProductMovements(
  accessToken: string,
  productId: number,
): Promise<StockMovement[]> {
  const response = await apiFetch(
    `/stock-movements/product/${productId}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar o histórico do produto.",
    );
  }

  return data as StockMovement[];
}

export async function createStockMovement(
  accessToken: string,
  input: CreateStockMovementInput,
): Promise<StockMovement> {
  const response = await apiFetch(
    "/stock-movements",
    {
      method: "POST",
      accessToken,
      body: JSON.stringify(input),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível registrar a movimentação.",
    );
  }

  return data as StockMovement;
}

export type StockMovementCounts = {
  ALL: number;
  IN: number;
  OUT: number;
  ADJUSTMENT: number;
};

export async function getStockMovementCounts(
  accessToken: string,
): Promise<StockMovementCounts> {
  const response = await apiFetch("/stock-movements/summary", {
    accessToken,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar os totais das movimentações.",
    );
  }

  return data as StockMovementCounts;
}
