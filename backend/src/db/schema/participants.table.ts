import { pgTable, uuid, timestamp, varchar, boolean, primaryKey, text } from 'drizzle-orm/pg-core';
import { users } from './users.table';
import { conversations } from './conversations.table';

export const participants = pgTable('participants', {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
    userId: text('user_id').references(() => users.id).notNull(),
    role: varchar('role', { length: 20 }).default('member').notNull(),
    nickname: varchar('nickname', { length: 100 }),
    isMuted: boolean('is_muted').default(false),
    mutedUntil: timestamp('muted_until', { withTimezone: true }),
    lastReadMessageId: uuid('last_read_message_id'),
    lastReadAt: timestamp('last_read_at', { withTimezone: true }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
    leftAt: timestamp('left_at', { withTimezone: true }),
    isArchived: boolean('is_archived').default(false).notNull(),
});

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
