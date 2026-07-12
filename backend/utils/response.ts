// ============================================================
// Common API Response Utility
// ============================================================

export type ResponseCode =
  | 'SUCCESS'
  | 'CREATED'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface ApiSuccessResponse<T = unknown> {
  status: true;
  code: ResponseCode;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: false;
  code: ResponseCode;
  message: string;
  error: true;
  errorMessage: string;
  data: null;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ──────────────────────────────────────────────────────────────
// Success Response
// ──────────────────────────────────────────────────────────────
export function successResponse<T = unknown>(
  data: T,
  message: string = 'Request successful',
  code: ResponseCode = 'SUCCESS',
): ApiSuccessResponse<T> {
  return {
    status: true,
    code,
    message,
    data,
  };
}

// ──────────────────────────────────────────────────────────────
// Error Response
// ──────────────────────────────────────────────────────────────
export function errorResponse(
  message: string = 'Something went wrong',
  errorMessage: string = 'An unexpected error occurred',
  code: ResponseCode = 'INTERNAL_SERVER_ERROR',
): ApiErrorResponse {
  return {
    status: false,
    code,
    message,
    error: true,
    errorMessage,
    data: null,
  };
}

// ──────────────────────────────────────────────────────────────
// HTTP Status Code Map (for use in controllers/interceptors)
// ──────────────────────────────────────────────────────────────
export const HTTP_STATUS_MAP: Record<ResponseCode, number> = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
