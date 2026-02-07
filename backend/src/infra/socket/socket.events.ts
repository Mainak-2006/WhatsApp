import { Server, Socket } from 'socket.io';
import { PresenceService } from '../../services/presence.service';
import { MessageService } from '../../services/message.service';

const presenceService = new PresenceService();
const messageService = new MessageService();

export function registerSocketEvents(io: Server, socket: Socket): void {
    const userId = socket.userId!;

    // Set user online when connected
    try {
        presenceService.setOnline(userId, socket.id).catch(err => {
            console.error(`Failed to set user ${userId} online:`, err.message);
        });
    } catch (error) {
        console.error(`Error in registerSocketEvents for user ${userId}:`, error);
    }

    // Join conversation rooms
    socket.on('join:conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave:conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${userId} left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on('message:send', async (data: { conversationId: string; content: string; messageType?: string }) => {
        try {
            const message = await messageService.sendMessage(userId, {
                conversationId: data.conversationId,
                content: data.content,
                messageType: (data.messageType as any) || 'text',
            });

            // Broadcast to conversation room
            io.to(`conversation:${data.conversationId}`).emit('message:new', message);
        } catch (error) {
            socket.emit('message:error', { error: 'Failed to send message' });
        }
    });

    // Handle typing indicator
    socket.on('typing:start', (conversationId: string) => {
        socket.to(`conversation:${conversationId}`).emit('typing:start', { userId, conversationId });
    });

    socket.on('typing:stop', (conversationId: string) => {
        socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId, conversationId });
    });

    // Handle message read receipt
    socket.on('message:read', async (data: { messageId: string; conversationId: string }) => {
        await messageService.markAsRead(data.conversationId, userId, [data.messageId]);
        socket.to(`conversation:${data.conversationId}`).emit('message:read', {
            messageId: data.messageId,
            userId,
            readAt: new Date(),
        });
    });

    // Handle presence updates
    socket.on('presence:update', async (status: string) => {
        await presenceService.updateStatus(userId, status);
        socket.broadcast.emit('presence:changed', { userId, status, isOnline: true });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
        await presenceService.setOffline(userId);
        socket.broadcast.emit('presence:changed', { userId, isOnline: false, lastSeen: new Date() });
    });
}
