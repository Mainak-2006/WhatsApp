import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router } from './routes';
import { errorHandler, notFoundHandler, rateLimiters } from './middlewares';
import { env } from './config/env';
import { logger, httpLogStream, now } from './utils';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',')
        : '*',
    credentials: true,
}));

// HTTP request logging using Winston stream
if (env.NODE_ENV !== 'test') {
    app.use(morgan(
        env.NODE_ENV === 'production' ? 'combined' : 'dev',
        { stream: httpLogStream }
    ));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting for all API routes
app.use('/api', rateLimiters.api);

// Routes
app.use('/api', router);

// Health check (no rate limiting)
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: now(),
        environment: env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
    });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Log app startup
logger.info('Express app initialized', {
    environment: env.NODE_ENV,
    corsOrigin: env.NODE_ENV === 'production' ? 'restricted' : '*',
});

export { app };
