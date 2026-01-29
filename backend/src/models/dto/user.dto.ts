export interface UserDTO {
    id: string;
    email: string;
    phone?: string | null;
    displayName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    isOnline: boolean;
    lastSeen?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSummaryDTO {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    isOnline: boolean;
    lastSeen?: Date | null;
}
