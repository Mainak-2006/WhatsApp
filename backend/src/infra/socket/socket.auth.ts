import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { authConfig } from '../../config/auth.config';

interface DecodedToken {
    userId: string;
    email: string;
}

declare module 'socket.io' {
    interface Socket {
        userId?: string;
        userEmail?: string;
    }
}

export async function authenticateSocket(
    socket: Socket,
    next: (err?: Error) => void
): Promise<void> {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, authConfig.jwt.secret) as DecodedToken;

        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;

        next();
    } catch (error) {
        next(new Error('Invalid or expired token'));
    }
}
