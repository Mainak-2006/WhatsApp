import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation target options
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation options
 */
interface ValidationOptions {
    /** Strip unknown keys from the validated object */
    stripUnknown?: boolean;
    /** Custom error message prefix */
    errorPrefix?: string;
}

/**
 * Validates request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate ('body', 'query', 'params')
 * @param options - Additional validation options
 */
export const validate = <T>(
    schema: ZodSchema<T>,
    target: ValidationTarget = 'body',
    options: ValidationOptions = {}
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dataToValidate = req[target];

            const validated = await schema.parseAsync(dataToValidate);

            // Replace the original data with validated (and potentially transformed) data
            req[target] = validated as typeof req[typeof target];

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodErrors(error, options.errorPrefix);

                res.status(422).json({
                    success: false,
                    error: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    target,
                    details: formattedErrors,
                });
                return;
            }

            next(error);
        }
    };
};

/**
 * Validates multiple targets at once
 */
export const validateMultiple = (
    schemas: {
        body?: ZodSchema;
        query?: ZodSchema;
        params?: ZodSchema;
    },
    options: ValidationOptions = {}
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const errors: Record<string, Record<string, string[]>> = {};

            // Validate each target
            for (const [target, schema] of Object.entries(schemas)) {
                if (schema) {
                    try {
                        const validated = await schema.parseAsync(req[target as ValidationTarget]);
                        req[target as ValidationTarget] = validated;
                    } catch (error) {
                        if (error instanceof ZodError) {
                            errors[target] = formatZodErrors(error);
                        } else {
                            throw error;
                        }
                    }
                }
            }

            // If there are any errors, return them all
            if (Object.keys(errors).length > 0) {
                res.status(422).json({
                    success: false,
                    error: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: errors,
                });
                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Format Zod errors into a more readable format
 */
const formatZodErrors = (
    error: ZodError,
    prefix?: string
): Record<string, string[]> => {
    const formatted: Record<string, string[]> = {};

    for (const issue of error.errors) {
        const path = issue.path.length > 0 ? issue.path.join('.') : '_root';
        const key = prefix ? `${prefix}.${path}` : path;

        if (!formatted[key]) {
            formatted[key] = [];
        }

        formatted[key].push(issue.message);
    }

    return formatted;
};

/**
 * Common validation helpers
 */
export const validators = {
    /**
     * Validate UUID format
     */
    isUUID: (value: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    },

    /**
     * Validate email format
     */
    isEmail: (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    /**
     * Validate phone number (E.164 format)
     */
    isPhoneNumber: (value: string): boolean => {
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(value);
    },

    /**
     * Sanitize string input
     */
    sanitize: (value: string): string => {
        return value.trim().replace(/[<>]/g, '');
    },
};
