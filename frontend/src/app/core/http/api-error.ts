import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error.model';

export interface ParsedApiError {
  status: number;
  message: string;
  fieldErrors: Record<string, string[]>;
}

/**
 * Normalises anything a failed HTTP call can throw into one shape a form can render: a
 * page-level message plus the server's per-field validation messages. Network failures and
 * non-JSON bodies degrade to a generic message instead of throwing again.
 */
export function parseApiError(error: unknown, fallbackMessage = 'Something went wrong.'): ParsedApiError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return { status: 0, message: 'Cannot reach the server. Check your connection.', fieldErrors: {} };
    }
    const body = error.error as Partial<ApiError> | null;
    if (body && typeof body === 'object') {
      return {
        status: error.status,
        message: typeof body.message === 'string' && body.message ? body.message : fallbackMessage,
        fieldErrors: body.fieldErrors && typeof body.fieldErrors === 'object' ? body.fieldErrors : {},
      };
    }
    return { status: error.status, message: fallbackMessage, fieldErrors: {} };
  }
  return { status: -1, message: fallbackMessage, fieldErrors: {} };
}
