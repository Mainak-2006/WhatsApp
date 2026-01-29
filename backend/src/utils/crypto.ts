import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate a random string (for tokens, IDs, etc.)
 */
export const generateRandomString = (length = 32): string => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a random token (URL-safe base64)
 */
export const generateToken = (length = 32): string => {
    return crypto.randomBytes(length).toString('base64url');
};

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
    return crypto.randomUUID();
};

/**
 * Generate a short unique ID (for message IDs, etc.)
 */
export const generateShortId = (length = 12): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }

    return result;
};

/**
 * Generate OTP (One-Time Password)
 */
export const generateOTP = (length = 6): string => {
    const digits = '0123456789';
    const bytes = crypto.randomBytes(length);
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += digits[bytes[i] % 10];
    }

    return otp;
};

/**
 * Hash a string using SHA-256
 */
export const sha256 = (data: string): string => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Hash a string using SHA-512
 */
export const sha512 = (data: string): string => {
    return crypto.createHash('sha512').update(data).digest('hex');
};

/**
 * Create HMAC signature
 */
export const createHmac = (data: string, secret: string): string => {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 */
export const verifyHmac = (
    data: string,
    signature: string,
    secret: string
): boolean => {
    const expectedSignature = createHmac(data, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
};

/**
 * Encrypt data using AES-256-GCM
 */
export const encrypt = (
    plaintext: string,
    key: string
): { encrypted: string; iv: string; authTag: string } => {
    const keyBuffer = crypto.scryptSync(key, 'salt', 32);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv, {
        authTagLength: AUTH_TAG_LENGTH,
    });

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: cipher.getAuthTag().toString('hex'),
    };
};

/**
 * Decrypt data using AES-256-GCM
 */
export const decrypt = (
    encrypted: string,
    key: string,
    iv: string,
    authTag: string
): string => {
    const keyBuffer = crypto.scryptSync(key, 'salt', 32);
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, keyBuffer, ivBuffer, {
        authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

/**
 * Encrypt data and return as a single string (for easy storage)
 */
export const encryptString = (plaintext: string, key: string): string => {
    const { encrypted, iv, authTag } = encrypt(plaintext, key);
    return `${iv}:${authTag}:${encrypted}`;
};

/**
 * Decrypt a string encrypted with encryptString
 */
export const decryptString = (encryptedData: string, key: string): string => {
    const [iv, authTag, encrypted] = encryptedData.split(':');
    return decrypt(encrypted, key, iv, authTag);
};

/**
 * Generate a secure password reset token with expiry
 */
export const generatePasswordResetToken = (): {
    token: string;
    hash: string;
    expiresAt: Date;
} => {
    const token = generateToken(32);
    const hash = sha256(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return { token, hash, expiresAt };
};

/**
 * Verify a password reset token
 */
export const verifyPasswordResetToken = (
    token: string,
    storedHash: string,
    expiresAt: Date
): boolean => {
    if (new Date() > expiresAt) {
        return false;
    }

    const hash = sha256(token);
    return crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(storedHash, 'hex')
    );
};

/**
 * Mask sensitive data (e.g., for logging)
 */
export const maskString = (
    str: string,
    visibleChars = 4,
    maskChar = '*'
): string => {
    if (str.length <= visibleChars) {
        return maskChar.repeat(str.length);
    }

    const masked = maskChar.repeat(str.length - visibleChars);
    return masked + str.slice(-visibleChars);
};

/**
 * Mask email address
 */
export const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2
        ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
        : '*'.repeat(local.length);
    return `${maskedLocal}@${domain}`;
};

/**
 * Mask phone number
 */
export const maskPhone = (phone: string): string => {
    if (phone.length <= 4) {
        return '*'.repeat(phone.length);
    }
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
};
