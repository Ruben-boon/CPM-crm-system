// Common types for all entities
export interface BaseEntity {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Field configuration for forms and validation
export interface EntityField {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "date";
  required?: boolean;
  options?: string[];
  section?: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Common search parameters
export interface SearchParams {
  field: string;
  term: string;
}
