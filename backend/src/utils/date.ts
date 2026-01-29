/**
 * Date and time utilities for the WhatsApp backend
 */

/**
 * Get current timestamp in ISO format
 */
export const now = (): string => {
    return new Date().toISOString();
};

/**
 * Get current timestamp as Date object
 */
export const nowDate = (): Date => {
    return new Date();
};

/**
 * Get Unix timestamp in seconds
 */
export const unixTimestamp = (): number => {
    return Math.floor(Date.now() / 1000);
};

/**
 * Get Unix timestamp in milliseconds
 */
export const unixTimestampMs = (): number => {
    return Date.now();
};

/**
 * Convert Date to Unix timestamp
 */
export const toUnixTimestamp = (date: Date): number => {
    return Math.floor(date.getTime() / 1000);
};

/**
 * Convert Unix timestamp to Date
 */
export const fromUnixTimestamp = (timestamp: number): Date => {
    return new Date(timestamp * 1000);
};

/**
 * Add time to a date
 */
export const addTime = (
    date: Date,
    amount: number,
    unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
): Date => {
    const result = new Date(date);

    switch (unit) {
        case 'seconds':
            result.setSeconds(result.getSeconds() + amount);
            break;
        case 'minutes':
            result.setMinutes(result.getMinutes() + amount);
            break;
        case 'hours':
            result.setHours(result.getHours() + amount);
            break;
        case 'days':
            result.setDate(result.getDate() + amount);
            break;
        case 'weeks':
            result.setDate(result.getDate() + amount * 7);
            break;
        case 'months':
            result.setMonth(result.getMonth() + amount);
            break;
    }

    return result;
};

/**
 * Subtract time from a date
 */
export const subtractTime = (
    date: Date,
    amount: number,
    unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
): Date => {
    return addTime(date, -amount, unit);
};

/**
 * Get time difference between two dates
 */
export const timeDiff = (
    date1: Date,
    date2: Date,
    unit: 'seconds' | 'minutes' | 'hours' | 'days' = 'seconds'
): number => {
    const diffMs = Math.abs(date1.getTime() - date2.getTime());

    switch (unit) {
        case 'seconds':
            return Math.floor(diffMs / 1000);
        case 'minutes':
            return Math.floor(diffMs / (1000 * 60));
        case 'hours':
            return Math.floor(diffMs / (1000 * 60 * 60));
        case 'days':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date): boolean => {
    return date.getTime() < Date.now();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: Date): boolean => {
    return date.getTime() > Date.now();
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

/**
 * Check if a date is within a certain time ago
 */
export const isWithin = (
    date: Date,
    amount: number,
    unit: 'seconds' | 'minutes' | 'hours' | 'days'
): boolean => {
    const threshold = subtractTime(new Date(), amount, unit);
    return date.getTime() >= threshold.getTime();
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const absDiffMs = Math.abs(diffMs);
    const isPast = diffMs < 0;

    const seconds = Math.floor(absDiffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let value: number;
    let unit: string;

    if (years > 0) {
        value = years;
        unit = years === 1 ? 'year' : 'years';
    } else if (months > 0) {
        value = months;
        unit = months === 1 ? 'month' : 'months';
    } else if (weeks > 0) {
        value = weeks;
        unit = weeks === 1 ? 'week' : 'weeks';
    } else if (days > 0) {
        value = days;
        unit = days === 1 ? 'day' : 'days';
    } else if (hours > 0) {
        value = hours;
        unit = hours === 1 ? 'hour' : 'hours';
    } else if (minutes > 0) {
        value = minutes;
        unit = minutes === 1 ? 'minute' : 'minutes';
    } else {
        return isPast ? 'just now' : 'in a moment';
    }

    return isPast ? `${value} ${unit} ago` : `in ${value} ${unit}`;
};

/**
 * Format date for display (e.g., "Jan 29, 2026")
 */
export const formatDate = (date: Date, locale = 'en-US'): string => {
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format time for display (e.g., "2:30 PM")
 */
export const formatTime = (date: Date, locale = 'en-US'): string => {
    return date.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: Date, locale = 'en-US'): string => {
    return `${formatDate(date, locale)} at ${formatTime(date, locale)}`;
};

/**
 * Get start of day
 */
export const startOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

/**
 * Get end of day
 */
export const endOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

/**
 * Parse ISO date string safely
 */
export const parseDate = (dateString: string): Date | null => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
};

/**
 * Get token expiration date (for JWT)
 */
export const getTokenExpiration = (expiresIn: string): Date => {
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
        throw new Error(`Invalid expiration format: ${expiresIn}`);
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2];

    const unitMap: Record<string, 'seconds' | 'minutes' | 'hours' | 'days'> = {
        s: 'seconds',
        m: 'minutes',
        h: 'hours',
        d: 'days',
    };

    return addTime(new Date(), amount, unitMap[unit]);
};
