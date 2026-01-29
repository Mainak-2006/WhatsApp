import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { authenticateSocket } from './socket.auth';
import { registerSocketEvents } from './socket.events';

let io: Server;

export function initializeSocketServer(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        pingInterval: 25000,
        pingTimeout: 60000,
    });

    // Authentication middleware
    io.use(authenticateSocket);

    // Connection handling
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // Register event handlers
        registerSocketEvents(io, socket);

        socket.on('disconnect', (reason) => {
            console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
        });
    });

    return io;
}

export function getSocketServer(): Server {
    if (!io) {
        throw new Error('Socket.IO server not initialized');
    }
    return io;
}
