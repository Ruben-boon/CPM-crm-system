import { ApiResponse, SearchParams } from './entity';

export interface ApiClient {
  get: <T>(path: string) => Promise<ApiResponse<T>>;
  post: <T>(path: string, data: any) => Promise<ApiResponse<T>>;
  put: <T>(path: string, data: any) => Promise<ApiResponse<T>>;
  delete: <T>(path: string) => Promise<ApiResponse<T>>;
}

export interface EntityService<T> {
  search: (params: SearchParams) => Promise<ApiResponse<T[]>>;
  getById: (id: string) => Promise<ApiResponse<T>>;
  create: (data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>) => Promise<ApiResponse<T>>;
  update: (id: string, data: Partial<T>) => Promise<ApiResponse<T>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}