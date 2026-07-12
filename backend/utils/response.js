// ============================================================
// Common API Response Utility
// ============================================================
// ──────────────────────────────────────────────────────────────
// Success Response
// ──────────────────────────────────────────────────────────────
export function successResponse(data, message = 'Request successful', code = 'SUCCESS') {
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
export function errorResponse(message = 'Something went wrong', errorMessage = 'An unexpected error occurred', code = 'INTERNAL_SERVER_ERROR') {
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
export const HTTP_STATUS_MAP = {
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
