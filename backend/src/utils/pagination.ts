import { SQL, sql } from 'drizzle-orm';

export interface PaginationParams {
    page?: number;
    limit?: number;
    cursor?: string;
}

export interface PaginationResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface CursorPaginationResult<T> {
    data: T[];
    meta: {
        nextCursor: string | null;
        prevCursor: string | null;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        limit: number;
    };
}

// Default pagination values
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Parse and validate pagination parameters from query string
 */
export const parsePaginationParams = (query: Record<string, unknown>): {
    page: number;
    limit: number;
    offset: number;
} => {
    let page = parseInt(String(query.page), 10) || DEFAULT_PAGE;
    let limit = parseInt(String(query.limit), 10) || DEFAULT_LIMIT;

    // Ensure page is at least 1
    page = Math.max(1, page);

    // Ensure limit is within bounds
    limit = Math.min(Math.max(1, limit), MAX_LIMIT);

    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

/**
 * Create pagination result with metadata
 */
export const createPaginationResult = <T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginationResult<T> => {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};

/**
 * Create cursor-based pagination result
 * Useful for infinite scroll or real-time data
 */
export const createCursorPaginationResult = <T extends { id: string }>(
    data: T[],
    limit: number,
    hasMore: boolean
): CursorPaginationResult<T> => {
    const hasNextPage = hasMore;
    const nextCursor = hasNextPage && data.length > 0
        ? encodeCursor(data[data.length - 1].id)
        : null;

    return {
        data,
        meta: {
            nextCursor,
            prevCursor: data.length > 0 ? encodeCursor(data[0].id) : null,
            hasNextPage,
            hasPrevPage: false, // Would need additional context
            limit,
        },
    };
};

/**
 * Encode cursor (base64)
 */
export const encodeCursor = (value: string): string => {
    return Buffer.from(value).toString('base64url');
};

/**
 * Decode cursor (base64)
 */
export const decodeCursor = (cursor: string): string | null => {
    try {
        return Buffer.from(cursor, 'base64url').toString('utf8');
    } catch {
        return null;
    }
};

/**
 * Parse cursor-based pagination parameters
 */
export const parseCursorPaginationParams = (query: Record<string, unknown>): {
    cursor: string | null;
    limit: number;
    direction: 'forward' | 'backward';
} => {
    const cursor = typeof query.cursor === 'string'
        ? decodeCursor(query.cursor)
        : null;

    let limit = parseInt(String(query.limit), 10) || DEFAULT_LIMIT;
    limit = Math.min(Math.max(1, limit), MAX_LIMIT);

    const direction = query.direction === 'backward' ? 'backward' : 'forward';

    return { cursor, limit, direction };
};

/**
 * Build SQL LIMIT and OFFSET clause
 */
export const buildPaginationSQL = (page: number, limit: number): SQL => {
    const offset = (page - 1) * limit;
    return sql`LIMIT ${limit} OFFSET ${offset}`;
};

/**
 * Calculate page info from offset-based results
 */
export const calculatePageInfo = (
    offset: number,
    limit: number,
    total: number
): {
    currentPage: number;
    totalPages: number;
    isFirstPage: boolean;
    isLastPage: boolean;
} => {
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
        currentPage,
        totalPages,
        isFirstPage: currentPage === 1,
        isLastPage: currentPage >= totalPages,
    };
};

/**
 * Paginate an array in memory (for small datasets)
 */
export const paginateArray = <T>(
    array: T[],
    page: number,
    limit: number
): PaginationResult<T> => {
    const offset = (page - 1) * limit;
    const data = array.slice(offset, offset + limit);

    return createPaginationResult(data, array.length, page, limit);
};

/**
 * Generate page numbers for UI pagination
 */
export const generatePageNumbers = (
    currentPage: number,
    totalPages: number,
    maxVisible = 5
): (number | '...')[] => {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
        end = maxVisible - 1;
    } else if (currentPage >= totalPages - half) {
        start = totalPages - maxVisible + 2;
    }

    if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
    }

    return pages;
};
