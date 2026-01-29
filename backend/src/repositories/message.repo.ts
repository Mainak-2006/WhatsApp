import { eq, desc, lt, and, isNull, inArray } from 'drizzle-orm';
import { db } from '../db';
import { messages, NewMessage, Message } from '../db/schema/messages.table';
import { participants } from '../db/schema/participants.table';

export class MessageRepository {
    async findById(id: string): Promise<Message | undefined> {
        const result = await db
            .select()
            .from(messages)
            .where(and(eq(messages.id, id), isNull(messages.isDeleted)))
            .limit(1);
        return result[0];
    }

    async findByConversationId(
        conversationId: string,
        limit: number = 50,
        cursor?: string
    ): Promise<Message[]> {
        if (cursor) {
            const cursorMessage = await this.findById(cursor);
            if (cursorMessage) {
                return db
                    .select()
                    .from(messages)
                    .where(
                        and(
                            eq(messages.conversationId, conversationId),
                            isNull(messages.isDeleted),
                            lt(messages.createdAt, cursorMessage.createdAt)
                        )
                    )
                    .orderBy(desc(messages.createdAt))
                    .limit(limit);
            }
        }

        return db
            .select()
            .from(messages)
            .where(and(eq(messages.conversationId, conversationId), isNull(messages.isDeleted)))
            .orderBy(desc(messages.createdAt))
            .limit(limit);
    }

    async create(data: Partial<NewMessage> & { conversationId: string; senderId: string }): Promise<Message> {
        const [message] = await db.insert(messages).values(data as NewMessage).returning();
        return message;
    }

    async update(id: string, data: Partial<NewMessage>): Promise<Message | undefined> {
        const [updated] = await db
            .update(messages)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(messages.id, id))
            .returning();
        return updated;
    }

    async softDelete(id: string): Promise<void> {
        await db
            .update(messages)
            .set({ isDeleted: new Date() })
            .where(eq(messages.id, id));
    }

    async deleteForUser(messageId: string, userId: string): Promise<void> {
        // For per-user deletion, you'd need a separate deletedFor table
        // For now, just soft delete
        await this.softDelete(messageId);
    }

    async addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
        // This would typically use a reactions table
        // For now, we'll store in message metadata
        const message = await this.findById(messageId);
        if (!message) return;

        const mediaMetadata = (message.mediaMetadata as Record<string, unknown>)?.reactions || {};
        const userReactions = (mediaMetadata as Record<string, string[]>)[emoji] || [];

        if (!userReactions.includes(userId)) {
            userReactions.push(userId);
        }

        await db
            .update(messages)
            .set({
                mediaMetadata: {
                    ...(message.mediaMetadata as Record<string, unknown>),
                    reactions: { ...(mediaMetadata as object), [emoji]: userReactions },
                },
            })
            .where(eq(messages.id, messageId));
    }

    async markAsRead(messageId: string, userId: string): Promise<void> {
        const message = await this.findById(messageId);
        if (!message) return;

        await db
            .update(participants)
            .set({
                lastReadMessageId: messageId,
                lastReadAt: new Date(),
            })
            .where(
                and(
                    eq(participants.conversationId, message.conversationId),
                    eq(participants.userId, userId)
                )
            );
    }

    async markManyAsRead(conversationId: string, userId: string, messageIds: string[]): Promise<void> {
        if (messageIds.length === 0) return;

        // Get the latest message ID
        const latestMessageId = messageIds[messageIds.length - 1];

        await db
            .update(participants)
            .set({
                lastReadMessageId: latestMessageId,
                lastReadAt: new Date(),
            })
            .where(
                and(
                    eq(participants.conversationId, conversationId),
                    eq(participants.userId, userId)
                )
            );
    }
}
