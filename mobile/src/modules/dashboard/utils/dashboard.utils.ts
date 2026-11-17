import type { DashboardMovementChartItem } from "../dashboard.types";

export function formatDashboardNumber(value: number | string): string {
  return Number(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });
}

export function formatTurnoverRate(value: number | string): string {
  return Number(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
}

export type MovementChartViewItem = {
  date: string;
  label: string;
  entriesHeight: number;
  exitsHeight: number;
  entries: number;
  exits: number;
};

export function prepareMovementChartData(
  data: DashboardMovementChartItem[],
): MovementChartViewItem[] {
  const values = data.flatMap((item) => [
    Number(item.entries),
    Number(item.exits),
  ]);

  const maxValue = Math.max(...values, 1);

  return data.map((item) => {
    const entries = Number(item.entries);
    const exits = Number(item.exits);
    const date = new Date(`${item.date}T00:00:00`);

    return {
      date: item.date,
      label: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      entries,
      exits,
      entriesHeight:
        entries > 0 ? Math.max((entries / maxValue) * 130, 6) : 0,
      exitsHeight:
        exits > 0 ? Math.max((exits / maxValue) * 130, 6) : 0,
    };
  });
}
