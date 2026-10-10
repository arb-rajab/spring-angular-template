import { HttpErrorResponse } from '@angular/common/http';
import { parseApiError } from './api-error';

describe('parseApiError', () => {
  it('extracts the message and field errors from an ApiError body', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: 'Validation failed', fieldErrors: { email: ['must be a well-formed email address'] } },
    });

    expect(parseApiError(error)).toEqual({
      status: 400,
      message: 'Validation failed',
      fieldErrors: { email: ['must be a well-formed email address'] },
    });
  });

  it('reports an unreachable server for status 0', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(parseApiError(error).message).toContain('Cannot reach the server');
  });

  it('falls back to the supplied message for a non-JSON body', () => {
    const error = new HttpErrorResponse({ status: 502, error: '<html>Bad gateway</html>' });

    expect(parseApiError(error, 'Try again later.')).toEqual({
      status: 502,
      message: 'Try again later.',
      fieldErrors: {},
    });
  });

  it('handles values that are not HTTP errors', () => {
    expect(parseApiError(new Error('boom'))).toEqual({
      status: -1,
      message: 'Something went wrong.',
      fieldErrors: {},
    });
  });
});
