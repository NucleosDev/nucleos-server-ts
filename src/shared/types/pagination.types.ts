export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function parsePagination(params: PaginationParams): { page: number; limit: number; offset: number } {
  const page  = Math.max(1, params.page  ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  return { page, limit, offset: (page - 1) * limit };
}
