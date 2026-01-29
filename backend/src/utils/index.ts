// Logger
export { default as logger, httpLogStream, logRequest, logResponse, logError, logSocketEvent, logDatabaseQuery } from './logger';

// API Response helpers
export {
    sendSuccess,
    sendCreated,
    sendNoContent,
    sendError,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendConflict,
    sendValidationError,
    sendRateLimited,
    sendServerError,
    createPaginationMeta,
    type ApiResponse,
    type PaginationMeta,
} from './api-response';

// Async handlers
export {
    asyncHandler,
    asyncHandlers,
    catchAsync,
    tryCatch,
    retry,
} from './async-handler';

// Date utilities
export {
    now,
    nowDate,
    unixTimestamp,
    unixTimestampMs,
    toUnixTimestamp,
    fromUnixTimestamp,
    addTime,
    subtractTime,
    timeDiff,
    isPast,
    isFuture,
    isToday,
    isWithin,
    formatRelativeTime,
    formatDate,
    formatTime,
    formatDateTime,
    startOfDay,
    endOfDay,
    parseDate,
    getTokenExpiration,
} from './date';

// Crypto utilities
export {
    hashPassword,
    comparePassword,
    generateRandomString,
    generateToken,
    generateUUID,
    generateShortId,
    generateOTP,
    sha256,
    sha512,
    createHmac,
    verifyHmac,
    encrypt,
    decrypt,
    encryptString,
    decryptString,
    generatePasswordResetToken,
    verifyPasswordResetToken,
    maskString,
    maskEmail,
    maskPhone,
} from './crypto';

// Pagination utilities
export {
    parsePaginationParams,
    createPaginationResult,
    createCursorPaginationResult,
    encodeCursor,
    decodeCursor,
    parseCursorPaginationParams,
    buildPaginationSQL,
    calculatePageInfo,
    paginateArray,
    generatePageNumbers,
    DEFAULT_PAGE,
    DEFAULT_LIMIT,
    MAX_LIMIT,
    type PaginationParams,
    type PaginationResult,
    type CursorPaginationResult,
} from './pagination';
