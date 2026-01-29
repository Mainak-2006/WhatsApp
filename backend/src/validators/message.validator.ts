import { z } from 'zod';
import { uuidSchema, cursorPaginationSchema } from './common.validator';

// Message types
export const messageTypeSchema = z.enum([
    'text',
    'image',
    'video',
    'audio',
    'document',
    'location',
    'contact',
    'sticker',
]);

// Send text message
export const sendTextMessageSchema = z.object({
    body: z.object({
        conversationId: uuidSchema,
        content: z.string().min(1).max(4096).trim(),
        replyToId: uuidSchema.optional(),
    }),
});

// Send media message
export const sendMediaMessageSchema = z.object({
    body: z.object({
        conversationId: uuidSchema,
        type: z.enum(['image', 'video', 'audio', 'document']),
        mediaUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        fileName: z.string().max(255).optional(),
        fileSize: z.number().max(100 * 1024 * 1024).optional(), // 100MB max
        mimeType: z.string().optional(),
        caption: z.string().max(1024).optional(),
        replyToId: uuidSchema.optional(),
    }),
});

// Send location message
export const sendLocationMessageSchema = z.object({
    body: z.object({
        conversationId: uuidSchema,
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().max(500).optional(),
        replyToId: uuidSchema.optional(),
    }),
});

// Get messages
export const getMessagesSchema = z.object({
    params: z.object({ conversationId: uuidSchema }),
    query: cursorPaginationSchema,
});

// Edit message
export const editMessageSchema = z.object({
    params: z.object({ messageId: uuidSchema }),
    body: z.object({
        content: z.string().min(1).max(4096).trim(),
    }),
});

// Delete message
export const deleteMessageSchema = z.object({
    params: z.object({ messageId: uuidSchema }),
    body: z.object({
        deleteForEveryone: z.boolean().default(false),
    }),
});

// React to message
export const reactToMessageSchema = z.object({
    params: z.object({ messageId: uuidSchema }),
    body: z.object({
        emoji: z.string().min(1).max(10),
    }),
});

// Mark messages as read
export const markAsReadSchema = z.object({
    body: z.object({
        conversationId: uuidSchema,
        messageIds: z.array(uuidSchema).min(1).max(100),
    }),
});

// Forward message
export const forwardMessageSchema = z.object({
    body: z.object({
        messageId: uuidSchema,
        conversationIds: z.array(uuidSchema).min(1).max(10),
    }),
});

// Types
export type MessageType = z.infer<typeof messageTypeSchema>;
export type SendTextMessageInput = z.infer<typeof sendTextMessageSchema>['body'];
export type SendMediaMessageInput = z.infer<typeof sendMediaMessageSchema>['body'];
export type SendLocationMessageInput = z.infer<typeof sendLocationMessageSchema>['body'];
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>['body'];
export type ReactToMessageInput = z.infer<typeof reactToMessageSchema>['body'];
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>['body'];
export type ForwardMessageInput = z.infer<typeof forwardMessageSchema>['body'];
