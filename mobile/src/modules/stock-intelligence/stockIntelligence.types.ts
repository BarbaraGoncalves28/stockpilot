export type StockRiskLevel =
  | "OUT_OF_STOCK"
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "NO_DATA";

export type StockIntelligenceItem = {
  product_id: number;
  product_name: string;
  sku: string;
  current_stock: string;
  min_stock: string;
  average_daily_consumption: string;
  estimated_days_until_min_stock: string | null;
  risk_level: StockRiskLevel;
};

export type StockAlertItem = {
  product_id: number;
  product_name: string;
  sku: string;
  current_stock: string;
  min_stock: string;
  average_daily_consumption: string;
  estimated_days_until_min_stock: string | null;
  risk_level: StockRiskLevel;
  message: string;
  last_movement_at: string | null;
};