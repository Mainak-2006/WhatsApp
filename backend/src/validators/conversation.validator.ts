import { z } from 'zod';
import { uuidSchema, displayNameSchema, imageUrlSchema, paginationSchema } from './common.validator';

// Conversation types
export const conversationTypeSchema = z.enum(['private', 'group']);

// Create private conversation
export const createPrivateConversationSchema = z.object({
    body: z.object({
        participantId: uuidSchema,
    }),
});

// Create group conversation
export const createGroupConversationSchema = z.object({
    body: z.object({
        name: displayNameSchema,
        description: z.string().max(500).optional(),
        avatarUrl: imageUrlSchema,
        participantIds: z.array(uuidSchema).min(1).max(256),
    }),
});

// Get conversation by ID
export const getConversationSchema = z.object({
    params: z.object({ conversationId: uuidSchema }),
});

// Get user conversations
export const getUserConversationsSchema = z.object({
    query: paginationSchema,
});

// Update group conversation
export const updateGroupSchema = z.object({
    params: z.object({ conversationId: uuidSchema }),
    body: z.object({
        name: displayNameSchema.optional(),
        description: z.string().max(500).optional(),
        avatarUrl: imageUrlSchema,
    }),
});

// Add participants to group
export const addParticipantsSchema = z.object({
    params: z.object({ conversationId: uuidSchema }),
    body: z.object({
        participantIds: z.array(uuidSchema).min(1).max(50),
    }),
});

// Remove participant from group
export const removeParticipantSchema = z.object({
    params: z.object({
        conversationId: uuidSchema,
        participantId: uuidSchema,
    }),
});

// Update participant role
export const updateParticipantRoleSchema = z.object({
    params: z.object({
        conversationId: uuidSchema,
        participantId: uuidSchema,
    }),
    body: z.object({
        role: z.enum(['admin', 'member']),
    }),
});

// Mute conversation
export const muteConversationSchema = z.object({
    params: z.object({ conversationId: uuidSchema }),
    body: z.object({
        mutedUntil: z.string().datetime().optional(), // null = unmute
    }),
});

// Archive conversation
export const archiveConversationSchema = z.object({
    params: z.object({ conversationId: uuidSchema }),
});

// Leave group
export const leaveGroupSchema = z.object({
    params: z.object({ conversationId: uuidSchema }),
});

// Types
export type ConversationType = z.infer<typeof conversationTypeSchema>;
export type CreatePrivateConversationInput = z.infer<typeof createPrivateConversationSchema>['body'];
export type CreateGroupConversationInput = z.infer<typeof createGroupConversationSchema>['body'];
export type GetConversationInput = z.infer<typeof getConversationSchema>['params'];
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>['body'];
export type AddParticipantsInput = z.infer<typeof addParticipantsSchema>['body'];
export type UpdateParticipantRoleInput = z.infer<typeof updateParticipantRoleSchema>['body'];
export type MuteConversationInput = z.infer<typeof muteConversationSchema>['body'];
