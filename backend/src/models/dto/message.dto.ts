import { MessageType } from '../enums';
import { UserSummaryDTO } from './user.dto';

export interface MessageDTO {
    id: string;
    conversationId: string;
    senderId: string;
    sender?: UserSummaryDTO;
    content?: string | null;
    messageType: MessageType;
    mediaUrl?: string | null;
    mediaMetadata?: any;
    replyToId?: string | null;
    replyTo?: MessageDTO;
    isEdited?: Date | null;
    isDeleted?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface SendMessageDTO {
    conversationId: string;
    content?: string;
    messageType: MessageType;
    mediaUrl?: string;
    mediaMetadata?: any;
    replyToId?: string;
}
