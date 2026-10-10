/** Mirrors the backend's `PageResponse<T>`. `page` is zero-based. */
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface PageQuery {
  page?: number;
  size?: number;
  /** `property` or `property,asc|desc`. */
  sort?: string;
}
