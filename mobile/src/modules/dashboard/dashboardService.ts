import { apiFetch } from "../../api/client";

import type {
  DashboardMovementChartItem,
  DashboardSummary,
} from "./dashboard.types";

export async function getDashboardSummary(
  accessToken: string,
  days = 30,
): Promise<DashboardSummary> {
  const response = await apiFetch(
    `/dashboard/summary?days=${days}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "Não foi possível carregar o resumo do dashboard.",
    );
  }

  return data as DashboardSummary;
}

export async function getDashboardMovements(
  accessToken: string,
  days = 30,
): Promise<DashboardMovementChartItem[]> {
  const response = await apiFetch(
    `/dashboard/movements?days=${days}`,
    {
      accessToken,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "Não foi possível carregar os movimentos do dashboard.",
    );
  }

  return data as DashboardMovementChartItem[];
}