import { Request, Response, NextFunction } from 'express';

/**
 * Rate limit store entry
 */
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

/**
 * In-memory rate limit store
 * Note: For production, use Redis for distributed rate limiting
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration options
 */
interface RateLimitOptions {
    /** Time window in milliseconds */
    windowMs: number;
    /** Maximum number of requests per window */
    maxRequests: number;
    /** Custom message for rate limit exceeded */
    message?: string;
    /** Key generator function to identify clients */
    keyGenerator?: (req: Request) => string;
    /** Skip rate limiting for certain requests */
    skip?: (req: Request) => boolean;
    /** Handler when rate limit is exceeded */
    handler?: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * Default key generator using IP address and user ID if authenticated
 */
const defaultKeyGenerator = (req: Request): string => {
    const userId = req.user?.id;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return userId ? `user:${userId}` : `ip:${ip}`;
};

/**
 * Clean up expired entries periodically
 */
const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

// Prevent the cleanup interval from keeping the process alive
cleanupInterval.unref();

/**
 * Rate limiting middleware factory
 */
export const rateLimit = (options: RateLimitOptions) => {
    const {
        windowMs,
        maxRequests,
        message = 'Too many requests, please try again later.',
        keyGenerator = defaultKeyGenerator,
        skip,
        handler,
    } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
        // Skip rate limiting if skip function returns true
        if (skip && skip(req)) {
            return next();
        }

        const key = keyGenerator(req);
        const now = Date.now();

        let entry = rateLimitStore.get(key);

        // Initialize or reset entry if expired
        if (!entry || entry.resetTime < now) {
            entry = {
                count: 0,
                resetTime: now + windowMs,
            };
            rateLimitStore.set(key, entry);
        }

        entry.count++;

        // Calculate remaining requests and time
        const remaining = Math.max(0, maxRequests - entry.count);
        const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

        // Check if rate limit exceeded
        if (entry.count > maxRequests) {
            res.setHeader('Retry-After', resetSeconds.toString());

            if (handler) {
                return handler(req, res, next);
            }

            res.status(429).json({
                success: false,
                error: message,
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: resetSeconds,
            });
            return;
        }

        next();
    };
};

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
    /**
     * Standard API rate limiter
     * 100 requests per minute
     */
    api: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
        message: 'API rate limit exceeded. Please slow down.',
    }),

    /**
     * Strict rate limiter for authentication endpoints
     * 5 requests per minute
     */
    auth: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5,
        message: 'Too many authentication attempts. Please try again later.',
    }),

    /**
     * Message sending rate limiter
     * 30 messages per minute
     */
    messaging: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30,
        message: 'Message rate limit exceeded. Please slow down.',
    }),

    /**
     * File upload rate limiter
     * 10 uploads per minute
     */
    upload: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10,
        message: 'Upload rate limit exceeded. Please try again later.',
    }),

    /**
     * Lenient rate limiter for read-only endpoints
     * 200 requests per minute
     */
    readonly: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 200,
        message: 'Rate limit exceeded. Please slow down.',
    }),
};

/**
 * Create a custom rate limiter with user-defined options
 */
export const createRateLimiter = (
    maxRequests: number,
    windowMs: number = 60000,
    message?: string
) => {
    return rateLimit({
        windowMs,
        maxRequests,
        message: message || `Rate limit of ${maxRequests} requests per ${windowMs / 1000} seconds exceeded.`,
    });
};
