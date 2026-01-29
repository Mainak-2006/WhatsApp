import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';

interface DecodedToken {
    userId: string;
    email?: string;
    username?: string;
    iat: number;
    exp: number;
}

/**
 * Authentication middleware for protecting routes
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'No authorization header provided',
            });
            return;
        }

        // Support both "Bearer <token>" and just "<token>"
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'No token provided',
            });
            return;
        }

        const decoded = jwt.verify(token, authConfig.jwt.secret) as DecodedToken;

        // Attach user info to request
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            username: decoded.username,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'Token expired',
                message: 'Your session has expired. Please login again.',
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Invalid token',
                message: 'The provided token is invalid.',
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: 'An error occurred during authentication.',
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, authConfig.jwt.secret) as DecodedToken;

        req.user = {
            id: decoded.userId,
            email: decoded.email,
            username: decoded.username,
        };

        next();
    } catch {
        // Token is invalid, but that's okay for optional auth
        next();
    }
};
