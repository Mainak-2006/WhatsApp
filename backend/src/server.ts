import { createServer } from 'http';
import { app } from './app';
import { env } from './config/env';
import { initializeSocketServer } from './infra/socket/socket.server';

const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocketServer(httpServer);

const PORT = env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 WebSocket server is ready`);
});

export { httpServer };
