export interface Employee {
  businessEntityID?: number;
  name: string;
  departamento: string;
  personPhone: string;
  email: string;
  isActive?: boolean;
  modifiedDate?: string;
}

export interface PaginatedResponse<T> {
  message: string;
  statusCode: number;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  message: string;
  statusCode: number;
  data: T;
}

export interface ApiResponse {
  message: string;
  statusCode: number;
}

export interface EmployeeSearchParams {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
  q?: string;
}