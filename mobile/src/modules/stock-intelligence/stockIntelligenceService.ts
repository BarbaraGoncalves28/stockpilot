import { apiFetch } from "../../api/client";
import type {
  StockAlertItem,
  StockIntelligenceItem,
} from "./stockIntelligence.types";

export async function getStockIntelligence(
  accessToken: string,
  days = 30,
): Promise<StockIntelligenceItem[]> {
  const response = await apiFetch(
    `/stock-intelligence?days=${days}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar a inteligência de estoque.",
    );
  }

  return data as StockIntelligenceItem[];
}

export async function getStockIntelligenceAlerts(
  accessToken: string,
  days = 30,
): Promise<StockAlertItem[]> {
  const response = await apiFetch(
    `/stock-intelligence/alerts?days=${days}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar os alertas de estoque.",
    );
  }

  return data as StockAlertItem[];
}

export async function getProductStockIntelligence(
  accessToken: string,
  productId: number,
  days = 30,
): Promise<StockIntelligenceItem> {
  const response = await apiFetch(
    `/stock-intelligence/product/${productId}?days=${days}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        "Não foi possível carregar a inteligência do produto.",
    );
  }

  return data as StockIntelligenceItem;
}