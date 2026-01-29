import { PresenceRepository } from '../repositories/presence.repo';

export class PresenceService {
    private presenceRepo: PresenceRepository;

    constructor() {
        this.presenceRepo = new PresenceRepository();
    }

    async setOnline(userId: string, socketId: string) {
        return this.presenceRepo.upsert({
            userId,
            socketId,
            isOnline: true,
            lastSeen: new Date(),
        });
    }

    async setOffline(userId: string) {
        return this.presenceRepo.update(userId, {
            isOnline: false,
            lastSeen: new Date(),
            socketId: null,
        });
    }

    async getPresence(userId: string) {
        return this.presenceRepo.findByUserId(userId);
    }

    async getOnlineUsers(userIds: string[]) {
        return this.presenceRepo.findOnlineUsers(userIds);
    }

    async updateStatus(userId: string, status: string) {
        return this.presenceRepo.update(userId, { status });
    }
}
