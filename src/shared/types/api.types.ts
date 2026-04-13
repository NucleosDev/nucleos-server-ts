export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RequestWithUser extends Express.Request {
  user?: { id: string; email: string; role: string; fullName?: string };
}
