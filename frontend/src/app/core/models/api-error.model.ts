/** Mirrors the backend's `ApiError` payload. */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details: string[];
  fieldErrors: Record<string, string[]>;
}
