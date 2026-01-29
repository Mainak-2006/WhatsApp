import { ParticipantRole } from '../enums';
import { UserSummaryDTO } from './user.dto';
import { MessageDTO } from './message.dto';

export interface ParticipantDTO {
    userId: string;
    role: ParticipantRole;
    joinedAt: Date;
    user?: UserSummaryDTO;
}

export interface ConversationDTO {
    id: string;
    name?: string | null;
    isGroup: boolean;
    avatarUrl?: string | null;
    description?: string | null;
    createdBy?: string | null;
    lastMessageId?: string | null;
    lastMessageAt?: Date | null;
    lastMessage?: MessageDTO;
    participants?: ParticipantDTO[];
    unreadCount?: number;
    isMuted?: boolean;
    mutedUntil?: Date | null;
    isArchived?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateConversationDTO {
    participantIds: string[];
    isGroup: boolean;
    name?: string;
    description?: string;
    avatarUrl?: string;
}
