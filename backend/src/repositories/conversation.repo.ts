import { eq, desc, and, isNull, inArray } from 'drizzle-orm';
import { db } from '../db';
import { conversations, NewConversation, Conversation } from '../db/schema/conversations.table';
import { participants } from '../db/schema/participants.table';

export class ConversationRepository {
    async findById(id: string): Promise<Conversation | undefined> {
        const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
        return result[0];
    }

    async findByUserId(userId: string, pagination?: { limit: number; offset: number }): Promise<Conversation[]> {
        const userParticipations = await db
            .select({ conversationId: participants.conversationId })
            .from(participants)
            .where(and(eq(participants.userId, userId), isNull(participants.leftAt)));

        const conversationIds = userParticipations.map(p => p.conversationId);

        if (conversationIds.length === 0) return [];

        let query = db
            .select()
            .from(conversations)
            .where(inArray(conversations.id, conversationIds))
            .orderBy(desc(conversations.lastMessageAt));

        if (pagination) {
            query = query.limit(pagination.limit).offset(pagination.offset) as typeof query;
        }

        return query;
    }

    async countByUserId(userId: string): Promise<number> {
        const result = await db
            .select({ conversationId: participants.conversationId })
            .from(participants)
            .where(and(eq(participants.userId, userId), isNull(participants.leftAt)));
        return result.length;
    }

    async findPrivateConversation(userId1: string, userId2: string): Promise<Conversation | undefined> {
        // Find a private conversation between two users
        const user1Convos = await db
            .select({ conversationId: participants.conversationId })
            .from(participants)
            .where(eq(participants.userId, userId1));

        const user2Convos = await db
            .select({ conversationId: participants.conversationId })
            .from(participants)
            .where(eq(participants.userId, userId2));

        const commonConvoIds = user1Convos
            .map(p => p.conversationId)
            .filter(id => user2Convos.some(p => p.conversationId === id));

        if (commonConvoIds.length === 0) return undefined;

        const result = await db
            .select()
            .from(conversations)
            .where(and(
                inArray(conversations.id, commonConvoIds),
                eq(conversations.isGroup, false)
            ))
            .limit(1);

        return result[0];
    }

    async create(data: NewConversation, participantIds: string[]): Promise<Conversation> {
        const [conversation] = await db.insert(conversations).values(data).returning();

        // Add participants
        if (participantIds.length > 0) {
            await db.insert(participants).values(
                participantIds.map(userId => ({
                    conversationId: conversation.id,
                    userId,
                    role: userId === data.createdBy ? 'admin' : 'member',
                }))
            );
        }

        return conversation;
    }

    async update(id: string, data: Partial<NewConversation>): Promise<Conversation | undefined> {
        const [updated] = await db
            .update(conversations)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(conversations.id, id))
            .returning();
        return updated;
    }

    async delete(id: string): Promise<void> {
        await db.delete(conversations).where(eq(conversations.id, id));
    }

    async addParticipants(conversationId: string, userIds: string[]): Promise<void> {
        await db.insert(participants).values(
            userIds.map(userId => ({ conversationId, userId, role: 'member' }))
        );
    }

    async removeParticipant(conversationId: string, userId: string): Promise<void> {
        await db
            .update(participants)
            .set({ leftAt: new Date() })
            .where(and(eq(participants.conversationId, conversationId), eq(participants.userId, userId)));
    }

    async updateParticipantRole(conversationId: string, userId: string, role: 'admin' | 'member'): Promise<void> {
        await db
            .update(participants)
            .set({ role })
            .where(and(eq(participants.conversationId, conversationId), eq(participants.userId, userId)));
    }

    async muteConversation(conversationId: string, userId: string, mutedUntil: Date | null): Promise<void> {
        await db
            .update(participants)
            .set({ mutedUntil })
            .where(and(eq(participants.conversationId, conversationId), eq(participants.userId, userId)));
    }

    async archiveConversation(conversationId: string, userId: string): Promise<void> {
        await db
            .update(participants)
            .set({ isArchived: true })
            .where(and(eq(participants.conversationId, conversationId), eq(participants.userId, userId)));
    }
}
