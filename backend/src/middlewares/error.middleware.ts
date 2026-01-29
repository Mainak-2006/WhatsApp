import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ZodError } from 'zod';
import { logger, logError } from '../utils';

/**
 * Custom application error class
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        code?: string
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Common error types
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, true, 'NOT_FOUND');
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request') {
        super(message, 400, true, 'BAD_REQUEST');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, true, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, true, 'FORBIDDEN');
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(message, 409, true, 'CONFLICT');
    }
}

export class ValidationError extends AppError {
    public readonly errors: Record<string, string[]>;

    constructor(message: string = 'Validation failed', errors: Record<string, string[]> = {}) {
        super(message, 422, true, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

/**
 * Format Zod validation errors
 */
const formatZodErrors = (error: ZodError): Record<string, string[]> => {
    const formatted: Record<string, string[]> = {};

    for (const issue of error.errors) {
        const path = issue.path.join('.');
        if (!formatted[path]) {
            formatted[path] = [];
        }
        formatted[path].push(issue.message);
    }

    return formatted;
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log error using structured logger
    logError(err, {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        ip: req.ip,
    });

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        res.status(422).json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: formatZodErrors(err),
        });
        return;
    }

    // Handle custom ValidationError
    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code,
            details: err.errors,
        });
        return;
    }

    // Handle custom AppError
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code,
            ...(env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }

    // Handle unknown errors
    res.status(500).json({
        success: false,
        error: env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message,
        code: 'INTERNAL_SERVER_ERROR',
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * 404 Not Found handler for undefined routes
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.warn('Route not found', { method: req.method, path: req.originalUrl });

    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
        code: 'ROUTE_NOT_FOUND',
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = <T>(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
