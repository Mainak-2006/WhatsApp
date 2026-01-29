import { Request, Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { asyncHandler } from '../middlewares';
import {
    sendSuccess,
    sendCreated,
    sendNotFound,
    sendNoContent,
    parsePaginationParams,
    createPaginationMeta,
    logger,
} from '../utils';

export class ConversationController {
    private conversationService: ConversationService;

    constructor() {
        this.conversationService = new ConversationService();
    }

    getConversations = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { page, limit, offset } = parsePaginationParams(req.query);

        logger.info('Fetching conversations', { userId, page, limit });

        const { conversations, total } = await this.conversationService.getConversations(userId, { limit, offset });
        const meta = createPaginationMeta(page, limit, total);

        return sendSuccess(res, conversations, 'Conversations retrieved', 200, meta);
    });

    getConversationById = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const conversation = await this.conversationService.getConversationById(conversationId);

        if (!conversation) {
            return sendNotFound(res, 'Conversation not found');
        }

        return sendSuccess(res, conversation);
    });

    createConversation = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;

        logger.info('Creating conversation', { userId, type: req.body.type });

        const conversation = await this.conversationService.createConversation(userId, req.body);

        return sendCreated(res, conversation, 'Conversation created');
    });

    createGroup = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name, description, avatarUrl, participantIds } = req.body;

        logger.info('Creating group', { userId, name, participantCount: participantIds.length });

        const group = await this.conversationService.createGroup(userId, {
            name,
            description,
            avatarUrl,
            participantIds,
        });

        return sendCreated(res, group, 'Group created');
    });

    updateConversation = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const conversation = await this.conversationService.updateConversation(conversationId, req.body);

        if (!conversation) {
            return sendNotFound(res, 'Conversation not found');
        }

        return sendSuccess(res, conversation, 'Conversation updated');
    });

    deleteConversation = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        await this.conversationService.deleteConversation(conversationId);

        return sendNoContent(res);
    });

    addParticipants = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const { participantIds } = req.body;

        logger.info('Adding participants', { conversationId, count: participantIds.length });

        await this.conversationService.addParticipants(conversationId, participantIds);

        return sendSuccess(res, null, 'Participants added');
    });

    removeParticipant = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId, participantId } = req.params;
        await this.conversationService.removeParticipant(conversationId, participantId);

        return sendSuccess(res, null, 'Participant removed');
    });

    updateParticipantRole = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId, participantId } = req.params;
        const { role } = req.body;

        await this.conversationService.updateParticipantRole(conversationId, participantId, role);

        return sendSuccess(res, null, 'Participant role updated');
    });

    muteConversation = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const userId = req.user!.id;
        const { mutedUntil } = req.body;

        await this.conversationService.muteConversation(conversationId, userId, mutedUntil);

        return sendSuccess(res, null, mutedUntil ? 'Conversation muted' : 'Conversation unmuted');
    });

    archiveConversation = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const userId = req.user!.id;

        await this.conversationService.archiveConversation(conversationId, userId);

        return sendSuccess(res, null, 'Conversation archived');
    });

    leaveGroup = asyncHandler(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const userId = req.user!.id;

        await this.conversationService.leaveGroup(conversationId, userId);

        return sendSuccess(res, null, 'Left the group');
    });
}
