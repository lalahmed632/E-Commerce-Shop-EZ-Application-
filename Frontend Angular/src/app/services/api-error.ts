import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models';

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const apiError = error.error as ApiError | string | null;
    if (typeof apiError === 'string') {
      return apiError;
    }
    if (apiError?.errors) {
      return Object.entries(apiError.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join(' ');
    }
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.status === 0) {
      return 'Could not reach the API. Confirm the .NET backend is running and CORS allows this Angular origin.';
    }
  }

  return 'Something went wrong. Please try again.';
}
