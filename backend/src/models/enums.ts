export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    DOCUMENT = 'document',
    LOCATION = 'location',
    CONTACT = 'contact',
    STICKER = 'sticker',
}

export enum ParticipantRole {
    ADMIN = 'admin',
    MEMBER = 'member',
}

export enum PresenceStatus {
    AVAILABLE = 'available',
    BUSY = 'busy',
    AWAY = 'away',
    DO_NOT_DISTURB = 'do_not_disturb',
}

export enum ConversationType {
    PRIVATE = 'private',
    GROUP = 'group',
}

export enum NotificationType {
    NEW_MESSAGE = 'new_message',
    TYPING = 'typing',
    READ_RECEIPT = 'read_receipt',
    PRESENCE = 'presence',
}
