import { eq, inArray, and } from 'drizzle-orm';
import { db } from '../db';
import { presence, NewPresence, Presence } from '../db/schema/presence.table';

export class PresenceRepository {
    async findByUserId(userId: string): Promise<Presence | undefined> {
        const result = await db.select().from(presence).where(eq(presence.userId, userId)).limit(1);
        return result[0];
    }

    async findOnlineUsers(userIds: string[]): Promise<Presence[]> {
        if (userIds.length === 0) return [];

        return db
            .select()
            .from(presence)
            .where(and(inArray(presence.userId, userIds), eq(presence.isOnline, true)));
    }

    async upsert(data: NewPresence): Promise<Presence> {
        const existing = await this.findByUserId(data.userId);

        if (existing) {
            const [updated] = await db
                .update(presence)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(presence.userId, data.userId))
                .returning();
            return updated;
        }

        const [created] = await db.insert(presence).values(data).returning();
        return created;
    }

    async update(userId: string, data: Partial<NewPresence>): Promise<Presence | undefined> {
        const [updated] = await db
            .update(presence)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(presence.userId, userId))
            .returning();
        return updated;
    }

    async delete(userId: string): Promise<void> {
        await db.delete(presence).where(eq(presence.userId, userId));
    }
}
