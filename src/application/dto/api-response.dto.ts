export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: Date;
  statusCode?: number;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    errors?: string[],
    statusCode?: number
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.timestamp = new Date();
    this.statusCode = statusCode;
  }

  // 
  // MÉTODOS ESTÁTICOS - SUCESSO
  // 
  static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  static created<T>(data: T, message: string = 'Resource created successfully'): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data, undefined, 201);
  }

  static ok<T>(data: T, message: string = 'OK'): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data, undefined, 200);
  }

  static noContent(message: string = 'No content'): ApiResponse<null> {
    return new ApiResponse<null>(true, message, null, undefined, 204);
  }

  // 
  // MÉTODOS ESTÁTICOS - ERRO
  // 
  static error(message: string, errors?: string[], statusCode: number = 500): ApiResponse<null> {
    return new ApiResponse<null>(false, message, null, errors, statusCode);
  }

  static badRequest(message: string, errors?: string[]): ApiResponse<null> {
    return new ApiResponse<null>(false, message, null, errors, 400);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiResponse<null> {
    return new ApiResponse<null>(false, message, null, undefined, 401);
  }

  static forbidden(message: string = 'Forbidden'): ApiResponse<null> {
    return new ApiResponse<null>(false, message, null, undefined, 403);
  }

  static notFound(message: string = 'Not found'): ApiResponse<null> {
    return new ApiResponse<null>(false, message, null, undefined, 404);
  }

  static conflict(message: string, errors?: string[]): ApiResponse<null> {
    return new ApiResponse<null>(false, message, null, errors, 409);
  }

  static validationError(errors: string[]): ApiResponse<null> {
    return new ApiResponse<null>(false, 'Validation failed', null, errors, 422);
  }

  static internalError(message: string = 'Internal server error'): ApiResponse<null> {
    return new ApiResponse<null>(false, message, null, undefined, 500);
  }

  // 
  // MÉTODO PARA LOG
  // 
  toLog(): object {
    return {
      success: this.success,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      hasData: !!this.data,
      errorsCount: this.errors?.length || 0,
    };
  }

  // 
  // MÉTODO PARA RESPONSE DO EXPRESS
  // 
  send(res: any): void {
    const statusCode = this.statusCode || (this.success ? 200 : 500);
    res.status(statusCode).json(this);
  }
}

// 
// TIPO PARA PAGINAÇÃO
// 
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class ApiPaginatedResponse<T> extends ApiResponse<PaginatedResponse<T>> {
  constructor(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success'
  ) {
    const totalPages = Math.ceil(total / limit);
    super(true, message, {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  }

  static fromQuery<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success'
  ): ApiPaginatedResponse<T> {
    return new ApiPaginatedResponse<T>(items, total, page, limit, message);
  }
}