export type Product = {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    category_id: number;
    supplier_id: number | null;
    cost_price: string;
    sale_price: string;
    current_stock: string;
    min_stock: string;
    max_stock: string | null;
    unit: string;
    is_active: boolean;
    created_at: string;
    update_at: string;
};

export type ProductListResponse = {
    items: Product[];
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
};

export type ProductListParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    supplierId?: number;
    isActive?: boolean;
};

export type UpdateProductInput = {
  name?: string;
  sku?: string;
  description?: string | null;
  category_id?: number;
  supplier_id?: number | null;
  cost_price?: string;
  sale_price?: string;
  min_stock?: string;
  max_stock?: string | null;
  unit?: string;
};