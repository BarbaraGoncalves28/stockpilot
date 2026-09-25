export type StockMovementType =
  | "IN"
  | "OUT"
  | "ADJUSTMENT";

export type StockMovement = {
  id: number;
  product_id: number;
  user_id: number;
  movement_type: StockMovementType;
  quantity: string;
  previous_stock: string;
  new_stock: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
};

export type StockMovementListResponse = {
  items: StockMovement[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type StockMovementListParams = {
  page?: number;
  pageSize?: number;
  productId?: number;
  movementType?: StockMovementType;
  startDate?: string;
  endDate?: string;
};

export type CreateStockMovementInput = {
  product_id: number;
  movement_type: StockMovementType;
  quantity: string;
  reason?: string;
  notes?: string;
};