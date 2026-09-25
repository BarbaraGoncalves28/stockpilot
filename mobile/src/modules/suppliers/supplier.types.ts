export type Supplier = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SupplierListResponse = {
  items: Supplier[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type SupplierListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
};

export type CreateSupplierInput = {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
};

export type UpdateSupplierInput = {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  is_active?: boolean;
};