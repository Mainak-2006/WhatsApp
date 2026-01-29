import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
    }

    if (stack) {
        log += `\n${stack}`;
    }

    return log;
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    defaultMeta: { service: 'whatsapp-api' },
    transports: [
        // Console transport with colors for development
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
        }),
        // File transport for errors
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

// Stream for Morgan HTTP logging
export const httpLogStream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Helper methods for structured logging
export const logRequest = (method: string, path: string, userId?: string) => {
    logger.info('Incoming request', { method, path, userId });
};

export const logResponse = (method: string, path: string, statusCode: number, duration: number) => {
    logger.info('Response sent', { method, path, statusCode, duration: `${duration}ms` });
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
    logger.error(error.message, { ...context, stack: error.stack });
};

export const logSocketEvent = (event: string, userId: string, data?: unknown) => {
    logger.debug('Socket event', { event, userId, data });
};

export const logDatabaseQuery = (query: string, duration: number) => {
    logger.debug('Database query', { query, duration: `${duration}ms` });
};

export default logger;
