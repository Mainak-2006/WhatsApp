import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;

/**
 * Wraps an async route handler to catch errors and pass them to Express error middleware
 * This eliminates the need for try-catch blocks in every controller
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await UserService.findAll();
 *   return sendSuccess(res, users);
 * }));
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Wraps multiple async handlers
 */
export const asyncHandlers = (...handlers: AsyncRequestHandler[]): RequestHandler[] => {
    return handlers.map(asyncHandler);
};

/**
 * Creates a controller method that automatically catches errors
 * Useful for class-based controllers
 * 
 * @example
 * class UserController {
 *   getUsers = catchAsync(async (req, res) => {
 *     const users = await this.userService.findAll();
 *     return sendSuccess(res, users);
 *   });
 * }
 */
export const catchAsync = asyncHandler;

/**
 * Wrapper for service methods that may throw errors
 * Returns a tuple of [error, result] for easier error handling
 * 
 * @example
 * const [error, user] = await tryCatch(userService.findById(id));
 * if (error) {
 *   return sendNotFound(res, 'User not found');
 * }
 */
export const tryCatch = async <T>(
    promise: Promise<T>
): Promise<[Error | null, T | null]> => {
    try {
        const result = await promise;
        return [null, result];
    } catch (error) {
        return [error as Error, null];
    }
};

/**
 * Retry an async operation with exponential backoff
 * 
 * @example
 * const result = await retry(
 *   () => externalApiCall(),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 */
export const retry = async <T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        baseDelay?: number;
        maxDelay?: number;
        onRetry?: (error: Error, attempt: number) => void;
    } = {}
): Promise<T> => {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                throw lastError;
            }

            if (onRetry) {
                onRetry(lastError, attempt);
            }

            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};
