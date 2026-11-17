
export type DashboardSummary = {
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_movements: number;
  total_entries: string;
  total_exits: string;
  period_days: number;
  period_movements: number;
  period_entries: string;
  period_exits: string;
  period_balance: string;
  stock_turnover_rate: string;
  monthly_products: number;
  weekly_low_stock_products: number;
  weekly_out_of_stock_products: number;
  monthly_movements: number;
};

export type DashboardMovementChartItem = {
  date: string;
  entries: string;
  exits: string;
};

