import { Response } from 'express';

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    code?: string;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Send a success response
 */
export const sendSuccess = <T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: PaginationMeta
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
    };

    if (meta) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
export const sendCreated = <T>(
    res: Response,
    data: T,
    message = 'Created successfully'
): Response => {
    return sendSuccess(res, data, message, 201);
};

/**
 * Send a no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
    return res.status(204).send();
};

/**
 * Send an error response
 */
export const sendError = (
    res: Response,
    message: string,
    statusCode = 500,
    code?: string,
    error?: string
): Response => {
    const response: ApiResponse = {
        success: false,
        message,
    };

    if (code) {
        response.code = code;
    }

    if (error && process.env.NODE_ENV !== 'production') {
        response.error = error;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send a bad request response (400)
 */
export const sendBadRequest = (
    res: Response,
    message = 'Bad request',
    code?: string
): Response => {
    return sendError(res, message, 400, code);
};

/**
 * Send an unauthorized response (401)
 */
export const sendUnauthorized = (
    res: Response,
    message = 'Unauthorized'
): Response => {
    return sendError(res, message, 401, 'UNAUTHORIZED');
};

/**
 * Send a forbidden response (403)
 */
export const sendForbidden = (
    res: Response,
    message = 'Forbidden'
): Response => {
    return sendError(res, message, 403, 'FORBIDDEN');
};

/**
 * Send a not found response (404)
 */
export const sendNotFound = (
    res: Response,
    message = 'Resource not found'
): Response => {
    return sendError(res, message, 404, 'NOT_FOUND');
};

/**
 * Send a conflict response (409)
 */
export const sendConflict = (
    res: Response,
    message = 'Resource already exists'
): Response => {
    return sendError(res, message, 409, 'CONFLICT');
};

/**
 * Send a validation error response (422)
 */
export const sendValidationError = (
    res: Response,
    message = 'Validation failed',
    errors?: string
): Response => {
    return sendError(res, message, 422, 'VALIDATION_ERROR', errors);
};

/**
 * Send a rate limit response (429)
 */
export const sendRateLimited = (
    res: Response,
    message = 'Too many requests'
): Response => {
    return sendError(res, message, 429, 'RATE_LIMITED');
};

/**
 * Send an internal server error response (500)
 */
export const sendServerError = (
    res: Response,
    message = 'Internal server error',
    error?: string
): Response => {
    return sendError(res, message, 500, 'SERVER_ERROR', error);
};

/**
 * Create pagination meta object
 */
export const createPaginationMeta = (
    page: number,
    limit: number,
    total: number
): PaginationMeta => {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};
