import { pgTable, uuid, timestamp, varchar, boolean, text } from 'drizzle-orm/pg-core';
import { users } from './users.table';

export const presence = pgTable('presence', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => users.id).notNull().unique(),
    isOnline: boolean('is_online').default(false).notNull(),
    lastSeen: timestamp('last_seen', { withTimezone: true }).defaultNow().notNull(),
    status: varchar('status', { length: 50 }).default('available'),
    socketId: varchar('socket_id', { length: 100 }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Presence = typeof presence.$inferSelect;
export type NewPresence = typeof presence.$inferInsert;
