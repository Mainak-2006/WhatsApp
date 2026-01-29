import { z } from 'zod';

// ==================== Common Schemas ====================

/**
 * UUID v4 schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Phone number schema (E.164 format)
 * Examples: +14155552671, +919876543210
 */
export const phoneSchema = z
    .string()
    .regex(
        /^\+[1-9]\d{1,14}$/,
        'Phone number must be in E.164 format (e.g., +14155552671)'
    );

/**
 * Email schema
 */
export const emailSchema = z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim();

/**
 * Password schema with strong requirements
 */
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Simple password schema (less strict)
 */
export const simplePasswordSchema = z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be at most 128 characters');

/**
 * Username schema
 */
export const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
    )
    .toLowerCase()
    .trim();

/**
 * Display name schema
 */
export const displayNameSchema = z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be at most 50 characters')
    .trim();

/**
 * Bio/About schema
 */
export const bioSchema = z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .trim()
    .optional();

/**
 * URL schema
 */
export const urlSchema = z.string().url('Invalid URL format').optional();

/**
 * Image URL schema (with common image extensions)
 */
export const imageUrlSchema = z
    .string()
    .url('Invalid URL format')
    .regex(
        /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i,
        'URL must point to an image file'
    )
    .optional();

/**
 * Date string schema (ISO 8601)
 */
export const dateStringSchema = z.string().datetime('Invalid date format');

/**
 * Optional date string schema
 */
export const optionalDateStringSchema = z
    .string()
    .datetime('Invalid date format')
    .optional();

/**
 * Positive integer schema
 */
export const positiveIntSchema = z
    .number()
    .int('Must be an integer')
    .positive('Must be a positive number');

/**
 * Non-negative integer schema
 */
export const nonNegativeIntSchema = z
    .number()
    .int('Must be an integer')
    .nonnegative('Must be a non-negative number');

/**
 * Pagination page schema
 */
export const pageSchema = z.coerce
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .default(1);

/**
 * Pagination limit schema
 */
export const limitSchema = z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .default(20);

/**
 * Cursor for cursor-based pagination
 */
export const cursorSchema = z.string().optional();

/**
 * Search query schema
 */
export const searchQuerySchema = z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be at most 100 characters')
    .trim();

/**
 * Sort order schema
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

/**
 * Status enum schema
 */
export const statusSchema = z.enum(['active', 'inactive', 'pending', 'deleted']);

/**
 * Boolean string schema (for query params)
 */
export const booleanStringSchema = z
    .enum(['true', 'false', '1', '0'])
    .transform((val) => val === 'true' || val === '1');

/**
 * File size schema (in bytes, max 10MB)
 */
export const fileSizeSchema = z
    .number()
    .max(10 * 1024 * 1024, 'File size must be less than 10MB');

/**
 * Mime type schema for images
 */
export const imageMimeTypeSchema = z.enum([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
]);

/**
 * Mime type schema for media files
 */
export const mediaMimeTypeSchema = z.enum([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'application/pdf',
]);

// ==================== Pagination Schema ====================

export const paginationSchema = z.object({
    page: pageSchema,
    limit: limitSchema,
});

export const cursorPaginationSchema = z.object({
    cursor: cursorSchema,
    limit: limitSchema,
    direction: z.enum(['forward', 'backward']).default('forward'),
});

// ==================== ID Params Schema ====================

export const idParamSchema = z.object({
    id: uuidSchema,
});

export const userIdParamSchema = z.object({
    userId: uuidSchema,
});

// ==================== Types ====================

export type UUID = z.infer<typeof uuidSchema>;
export type Phone = z.infer<typeof phoneSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type Username = z.infer<typeof usernameSchema>;
export type DisplayName = z.infer<typeof displayNameSchema>;
export type Bio = z.infer<typeof bioSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
