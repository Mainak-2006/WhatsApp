import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { validate, validateMultiple, rateLimiters } from '../middlewares';
import {
    getMessagesSchema,
    sendTextMessageSchema,
    sendMediaMessageSchema,
    sendLocationMessageSchema,
    editMessageSchema,
    deleteMessageSchema,
    reactToMessageSchema,
    markAsReadSchema,
    forwardMessageSchema,
} from '../validators';

const messageRouter = Router();
const controller = new MessageController();

// Get messages for a conversation with cursor pagination
messageRouter.get(
    '/conversation/:conversationId',
    validateMultiple({
        params: getMessagesSchema.shape.params,
        query: getMessagesSchema.shape.query,
    }),
    controller.getMessages
);

// Get single message by ID
messageRouter.get(
    '/:messageId',
    validate(editMessageSchema.shape.params, 'params'),
    controller.getMessageById
);

// Send text message
messageRouter.post(
    '/text',
    rateLimiters.messaging,
    validate(sendTextMessageSchema.shape.body, 'body'),
    controller.sendTextMessage
);

// Send media message (image, video, audio, document)
messageRouter.post(
    '/media',
    rateLimiters.messaging,
    validate(sendMediaMessageSchema.shape.body, 'body'),
    controller.sendMediaMessage
);

// Send location message
messageRouter.post(
    '/location',
    rateLimiters.messaging,
    validate(sendLocationMessageSchema.shape.body, 'body'),
    controller.sendLocationMessage
);

// Edit message
messageRouter.patch(
    '/:messageId',
    validateMultiple({
        params: editMessageSchema.shape.params,
        body: editMessageSchema.shape.body,
    }),
    controller.editMessage
);

// Delete message
messageRouter.delete(
    '/:messageId',
    validateMultiple({
        params: deleteMessageSchema.shape.params,
        body: deleteMessageSchema.shape.body,
    }),
    controller.deleteMessage
);

// React to message
messageRouter.post(
    '/:messageId/react',
    validateMultiple({
        params: reactToMessageSchema.shape.params,
        body: reactToMessageSchema.shape.body,
    }),
    controller.reactToMessage
);

// Mark messages as read
messageRouter.post(
    '/read',
    validate(markAsReadSchema.shape.body, 'body'),
    controller.markAsRead
);

// Forward message
messageRouter.post(
    '/forward',
    validate(forwardMessageSchema.shape.body, 'body'),
    controller.forwardMessage
);

export { messageRouter };
