import { z } from 'zod';
import {
    uuidSchema,
    phoneSchema,
    displayNameSchema,
    usernameSchema,
    bioSchema,
    imageUrlSchema,
    searchQuerySchema,
    paginationSchema,
} from './common.validator';

// Get user by ID
export const getUserByIdSchema = z.object({
    params: z.object({ userId: uuidSchema }),
});

// Update profile
export const updateProfileSchema = z.object({
    body: z.object({
        displayName: displayNameSchema.optional(),
        username: usernameSchema.optional(),
        bio: bioSchema,
        avatarUrl: imageUrlSchema,
    }),
});

// Update privacy settings
export const updatePrivacySchema = z.object({
    body: z.object({
        lastSeenVisibility: z.enum(['everyone', 'contacts', 'nobody']).optional(),
        profilePhotoVisibility: z.enum(['everyone', 'contacts', 'nobody']).optional(),
        readReceipts: z.boolean().optional(),
    }),
});

// Search users
export const searchUsersSchema = z.object({
    query: z.object({
        q: searchQuerySchema,
        ...paginationSchema.shape,
    }),
});

// Search by phone numbers
export const searchByPhonesSchema = z.object({
    body: z.object({
        phones: z.array(phoneSchema).min(1).max(500),
    }),
});

// Block/unblock user
export const blockUserSchema = z.object({
    params: z.object({ userId: uuidSchema }),
});

// Types
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>['body'];
export type SearchUsersInput = z.infer<typeof searchUsersSchema>['query'];
export type SearchByPhonesInput = z.infer<typeof searchByPhonesSchema>['body'];
