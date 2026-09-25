export type Category = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryListResponse = {
  items: Category[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type CategoryListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string;
  is_active?: boolean;
};