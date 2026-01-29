import { z } from 'zod';
import {
    emailSchema,
    phoneSchema,
    passwordSchema,
    simplePasswordSchema,
    displayNameSchema,
    usernameSchema,
} from './common.validator';

// ==================== Register Schemas ====================

/**
 * Register with email
 */
export const registerWithEmailSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: passwordSchema,
        displayName: displayNameSchema,
        username: usernameSchema.optional(),
    }),
});

/**
 * Register with phone
 */
export const registerWithPhoneSchema = z.object({
    body: z.object({
        phone: phoneSchema,
        displayName: displayNameSchema,
        username: usernameSchema.optional(),
    }),
});

// ==================== Login Schemas ====================

/**
 * Login with email and password
 */
export const loginWithEmailSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z.string().min(1, 'Password is required'),
    }),
});

/**
 * Login with phone (initiates OTP)
 */
export const loginWithPhoneSchema = z.object({
    body: z.object({
        phone: phoneSchema,
    }),
});

/**
 * Verify OTP for phone login
 */
export const verifyOTPSchema = z.object({
    body: z.object({
        phone: phoneSchema,
        otp: z
            .string()
            .length(6, 'OTP must be 6 digits')
            .regex(/^\d+$/, 'OTP must contain only digits'),
    }),
});

// ==================== Token Schemas ====================

/**
 * Refresh token
 */
export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});

/**
 * Verify access token (from header)
 */
export const verifyTokenSchema = z.object({
    headers: z.object({
        authorization: z
            .string()
            .regex(/^Bearer .+$/, 'Authorization header must be in format: Bearer <token>'),
    }),
});

// ==================== Password Schemas ====================

/**
 * Forgot password (request reset)
 */
export const forgotPasswordSchema = z.object({
    body: z.object({
        email: emailSchema,
    }),
});

/**
 * Reset password with token
 */
export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        password: passwordSchema,
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }),
});

/**
 * Change password (when logged in)
 */
export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: passwordSchema,
        confirmPassword: z.string(),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }).refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword'],
    }),
});

// ==================== OAuth Schemas ====================

/**
 * OAuth callback
 */
export const oauthCallbackSchema = z.object({
    query: z.object({
        code: z.string().min(1, 'Authorization code is required'),
        state: z.string().optional(),
    }),
});

/**
 * OAuth token exchange
 */
export const oauthTokenSchema = z.object({
    body: z.object({
        provider: z.enum(['google', 'apple', 'facebook']),
        accessToken: z.string().min(1, 'Access token is required'),
        idToken: z.string().optional(),
    }),
});

// ==================== Session Schemas ====================

/**
 * Logout (revoke session)
 */
export const logoutSchema = z.object({
    body: z.object({
        refreshToken: z.string().optional(),
        allDevices: z.boolean().default(false),
    }),
});

/**
 * Device registration for push notifications
 */
export const registerDeviceSchema = z.object({
    body: z.object({
        deviceId: z.string().min(1, 'Device ID is required'),
        deviceType: z.enum(['ios', 'android', 'web']),
        pushToken: z.string().min(1, 'Push token is required'),
        deviceName: z.string().max(100).optional(),
    }),
});

/**
 * Unregister device
 */
export const unregisterDeviceSchema = z.object({
    body: z.object({
        deviceId: z.string().min(1, 'Device ID is required'),
    }),
});

// ==================== Types ====================

export type RegisterWithEmailInput = z.infer<typeof registerWithEmailSchema>['body'];
export type RegisterWithPhoneInput = z.infer<typeof registerWithPhoneSchema>['body'];
export type LoginWithEmailInput = z.infer<typeof loginWithEmailSchema>['body'];
export type LoginWithPhoneInput = z.infer<typeof loginWithPhoneSchema>['body'];
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>['query'];
export type OAuthTokenInput = z.infer<typeof oauthTokenSchema>['body'];
export type LogoutInput = z.infer<typeof logoutSchema>['body'];
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>['body'];
export type UnregisterDeviceInput = z.infer<typeof unregisterDeviceSchema>['body'];
