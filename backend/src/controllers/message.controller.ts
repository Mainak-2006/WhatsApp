import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { asyncHandler } from '../middlewares';
import {
    sendSuccess,
    sendCreated,
    sendNotFound,
    sendNoContent,
    parseCursorPaginationParams,
    createCursorPaginationResult,
    logger,
} from '../utils';

export class MessageController {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
    }

    getMessages = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const { cursor, limit } = parseCursorPaginationParams(req.query);

        logger.debug('Fetching messages', { conversationId, cursor, limit });

        const { messages, hasMore } = await this.messageService.getMessages(
            conversationId,
            limit,
            cursor
        );

        const result = createCursorPaginationResult(messages, limit, hasMore);

        return sendSuccess(res, result.data, 'Messages retrieved', 200, result.meta as any);
    });

    getMessageById = asyncHandler(async (req: Request, res: Response) => {
        const { messageId } = req.params;
        const message = await this.messageService.getMessageById(messageId);

        if (!message) {
            return sendNotFound(res, 'Message not found');
        }

        return sendSuccess(res, message);
    });

    sendTextMessage = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { conversationId, content, replyToId } = req.body;

        logger.info('Sending text message', { userId, conversationId });

        const message = await this.messageService.sendMessage(userId, {
            conversationId,
            messageType: 'text',
            content,
            replyToId,
        });

        return sendCreated(res, message, 'Message sent');
    });

    sendMediaMessage = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { conversationId, type, mediaUrl, thumbnailUrl, fileName, fileSize, mimeType, caption, replyToId } = req.body;

        logger.info('Sending media message', { userId, conversationId, type });

        const message = await this.messageService.sendMessage(userId, {
            conversationId,
            messageType: type,
            mediaUrl,
            thumbnailUrl,
            fileName,
            fileSize,
            mimeType,
            content: caption,
            replyToId,
        });

        return sendCreated(res, message, 'Media message sent');
    });

    sendLocationMessage = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { conversationId, latitude, longitude, address, replyToId } = req.body;

        const message = await this.messageService.sendMessage(userId, {
            conversationId,
            messageType: 'location',
            content: JSON.stringify({ latitude, longitude, address }),
            replyToId,
        });

        return sendCreated(res, message, 'Location shared');
    });

    editMessage = asyncHandler(async (req: Request, res: Response) => {
        const { messageId } = req.params;
        const userId = req.user!.id;
        const { content } = req.body;

        const message = await this.messageService.editMessage(messageId, userId, content);

        if (!message) {
            return sendNotFound(res, 'Message not found');
        }

        return sendSuccess(res, message, 'Message updated');
    });

    deleteMessage = asyncHandler(async (req: Request, res: Response) => {
        const { messageId } = req.params;
        const userId = req.user!.id;
        const { deleteForEveryone } = req.body;

        await this.messageService.deleteMessage(messageId, userId, deleteForEveryone);

        return sendNoContent(res);
    });

    reactToMessage = asyncHandler(async (req: Request, res: Response) => {
        const { messageId } = req.params;
        const userId = req.user!.id;
        const { emoji } = req.body;

        await this.messageService.reactToMessage(messageId, userId, emoji);

        return sendSuccess(res, null, 'Reaction added');
    });

    markAsRead = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { conversationId, messageIds } = req.body;

        await this.messageService.markAsRead(conversationId, userId, messageIds);

        return sendSuccess(res, null, 'Messages marked as read');
    });

    forwardMessage = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { messageId, conversationIds } = req.body;

        logger.info('Forwarding message', { userId, messageId, toCount: conversationIds.length });

        const messages = await this.messageService.forwardMessage(messageId, userId, conversationIds);

        return sendCreated(res, messages, 'Message forwarded');
    });
}
