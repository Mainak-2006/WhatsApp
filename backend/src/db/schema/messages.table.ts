import { pgTable, uuid, text, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.table';
import { conversations } from './conversations.table';

export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
    senderId: uuid('sender_id').references(() => users.id).notNull(),
    content: text('content'),
    messageType: varchar('message_type', { length: 20 }).default('text').notNull(),
    mediaUrl: text('media_url'),
    mediaMetadata: jsonb('media_metadata'),
    replyToId: uuid('reply_to_id'),
    isEdited: timestamp('is_edited', { withTimezone: true }),
    isDeleted: timestamp('is_deleted', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
