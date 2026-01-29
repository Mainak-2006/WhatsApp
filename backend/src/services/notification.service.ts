export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, unknown>;
}

export class NotificationService {
    async sendPushNotification(userId: string, payload: NotificationPayload) {
        // TODO: Implement push notification logic (e.g., Firebase Cloud Messaging)
        console.log(`Sending push notification to user ${userId}:`, payload);
    }

    async sendToMultiple(userIds: string[], payload: NotificationPayload) {
        await Promise.all(
            userIds.map(userId => this.sendPushNotification(userId, payload))
        );
    }

    async notifyNewMessage(
        recipientIds: string[],
        senderName: string,
        messagePreview: string,
        conversationId: string
    ) {
        await this.sendToMultiple(recipientIds, {
            title: senderName,
            body: messagePreview,
            data: {
                type: 'new_message',
                conversationId,
            },
        });
    }

    async notifyTyping(recipientIds: string[], senderName: string, conversationId: string) {
        await this.sendToMultiple(recipientIds, {
            title: 'Typing...',
            body: `${senderName} is typing...`,
            data: {
                type: 'typing',
                conversationId,
            },
        });
    }
}
