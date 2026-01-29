import { MessageRepository } from '../repositories/message.repo';
import { NewMessage } from '../db/schema/messages.table';
import { logger, generateShortId } from '../utils';

export interface SendMessageData {
    conversationId: string;
    messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker';
    content?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    replyToId?: string;
}

export class MessageService {
    private messageRepo: MessageRepository;

    constructor() {
        this.messageRepo = new MessageRepository();
    }

    async getMessages(conversationId: string, limit: number = 50, cursor?: string | null) {
        logger.debug('Getting messages', { conversationId, limit, cursor });
        const messages = await this.messageRepo.findByConversationId(conversationId, limit + 1, cursor || undefined);
        const hasMore = messages.length > limit;

        return {
            messages: hasMore ? messages.slice(0, -1) : messages,
            hasMore,
        };
    }

    async getMessageById(id: string) {
        return this.messageRepo.findById(id);
    }

    async sendMessage(senderId: string, data: SendMessageData) {
        logger.info('Sending message', { senderId, conversationId: data.conversationId, messageType: data.messageType });

        const message = await this.messageRepo.create({
            conversationId: data.conversationId,
            senderId,
            messageType: data.messageType,
            content: data.content,
            mediaUrl: data.mediaUrl,
            mediaMetadata: {
                thumbnailUrl: data.thumbnailUrl,
                fileName: data.fileName,
                fileSize: data.fileSize,
                mimeType: data.mimeType,
            },
            replyToId: data.replyToId,
        });

        // TODO: Emit socket event for real-time delivery

        return message;
    }

    async editMessage(messageId: string, userId: string, content: string) {
        logger.info('Editing message', { messageId, userId });

        const message = await this.messageRepo.findById(messageId);
        if (!message || message.senderId !== userId) {
            return null;
        }

        return this.messageRepo.update(messageId, {
            content,
            isEdited: new Date(),
        });
    }

    async deleteMessage(messageId: string, userId: string, deleteForEveryone: boolean = false) {
        logger.info('Deleting message', { messageId, userId, deleteForEveryone });

        if (deleteForEveryone) {
            return this.messageRepo.softDelete(messageId);
        }

        return this.messageRepo.deleteForUser(messageId, userId);
    }

    async reactToMessage(messageId: string, userId: string, emoji: string) {
        logger.debug('Adding reaction', { messageId, userId, emoji });
        return this.messageRepo.addReaction(messageId, userId, emoji);
    }

    async markAsRead(conversationId: string, userId: string, messageIds: string[]) {
        logger.debug('Marking messages as read', { conversationId, userId, count: messageIds.length });
        return this.messageRepo.markManyAsRead(conversationId, userId, messageIds);
    }

    async forwardMessage(messageId: string, userId: string, conversationIds: string[]) {
        logger.info('Forwarding message', { messageId, userId, toCount: conversationIds.length });

        const originalMessage = await this.messageRepo.findById(messageId);
        if (!originalMessage) {
            return [];
        }

        const forwardedMessages = await Promise.all(
            conversationIds.map(conversationId =>
                this.messageRepo.create({
                    conversationId,
                    senderId: userId,
                    messageType: originalMessage.messageType,
                    content: originalMessage.content,
                    mediaUrl: originalMessage.mediaUrl,
                    mediaMetadata: {
                        ...(originalMessage.mediaMetadata as Record<string, unknown>),
                        forwardedFromId: messageId,
                    },
                })
            )
        );

        return forwardedMessages;
    }
}
