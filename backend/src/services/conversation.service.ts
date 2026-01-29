import { ConversationRepository } from '../repositories/conversation.repo';
import { NewConversation } from '../db/schema/conversations.table';
import { logger, generateUUID } from '../utils';
import { CreatePrivateConversationInput, CreateGroupConversationInput } from '../validators';

export class ConversationService {
    private conversationRepo: ConversationRepository;

    constructor() {
        this.conversationRepo = new ConversationRepository();
    }

    async getConversations(userId: string, pagination: { limit: number; offset: number }) {
        logger.debug('Getting conversations', { userId, ...pagination });
        const conversations = await this.conversationRepo.findByUserId(userId, pagination);
        const total = await this.conversationRepo.countByUserId(userId);
        return { conversations, total };
    }

    async getConversationById(id: string) {
        return this.conversationRepo.findById(id);
    }

    async createConversation(userId: string, data: CreatePrivateConversationInput) {
        logger.info('Creating private conversation', { userId, participantId: data.participantId });

        // Check if conversation already exists
        const existing = await this.conversationRepo.findPrivateConversation(userId, data.participantId);
        if (existing) {
            return existing;
        }

        return this.conversationRepo.create({
            isGroup: false,
            createdBy: userId,
        }, [userId, data.participantId]);
    }

    async createGroup(userId: string, data: CreateGroupConversationInput) {
        logger.info('Creating group conversation', { userId, name: data.name, participantCount: data.participantIds.length });

        return this.conversationRepo.create({
            isGroup: true,
            name: data.name,
            description: data.description,
            avatarUrl: data.avatarUrl,
            createdBy: userId,
        }, [userId, ...data.participantIds]);
    }

    async updateConversation(id: string, data: Partial<NewConversation>) {
        return this.conversationRepo.update(id, data);
    }

    async deleteConversation(id: string) {
        logger.info('Deleting conversation', { conversationId: id });
        return this.conversationRepo.delete(id);
    }

    async addParticipants(conversationId: string, participantIds: string[]) {
        logger.info('Adding participants', { conversationId, count: participantIds.length });
        return this.conversationRepo.addParticipants(conversationId, participantIds);
    }

    async removeParticipant(conversationId: string, userId: string) {
        logger.info('Removing participant', { conversationId, userId });
        return this.conversationRepo.removeParticipant(conversationId, userId);
    }

    async updateParticipantRole(conversationId: string, userId: string, role: 'admin' | 'member') {
        logger.info('Updating participant role', { conversationId, userId, role });
        return this.conversationRepo.updateParticipantRole(conversationId, userId, role);
    }

    async muteConversation(conversationId: string, userId: string, mutedUntil?: string) {
        return this.conversationRepo.muteConversation(conversationId, userId, mutedUntil ? new Date(mutedUntil) : null);
    }

    async archiveConversation(conversationId: string, userId: string) {
        return this.conversationRepo.archiveConversation(conversationId, userId);
    }

    async leaveGroup(conversationId: string, userId: string) {
        logger.info('User leaving group', { conversationId, userId });
        return this.conversationRepo.removeParticipant(conversationId, userId);
    }
}
