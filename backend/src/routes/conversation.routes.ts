import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { validate, validateMultiple } from '../middlewares';
import {
    getConversationSchema,
    getUserConversationsSchema,
    createPrivateConversationSchema,
    createGroupConversationSchema,
    updateGroupSchema,
    addParticipantsSchema,
    removeParticipantSchema,
    updateParticipantRoleSchema,
    muteConversationSchema,
    archiveConversationSchema,
    leaveGroupSchema,
} from '../validators';

const conversationRouter = Router();
const controller = new ConversationController();

// Get user's conversations with pagination
conversationRouter.get(
    '/',
    validate(getUserConversationsSchema.shape.query, 'query'),
    controller.getConversations
);

// Get conversation by ID
conversationRouter.get(
    '/:conversationId',
    validate(getConversationSchema.shape.params, 'params'),
    controller.getConversationById
);

// Create private conversation
conversationRouter.post(
    '/private',
    validate(createPrivateConversationSchema.shape.body, 'body'),
    controller.createConversation
);

// Create group conversation
conversationRouter.post(
    '/group',
    validate(createGroupConversationSchema.shape.body, 'body'),
    controller.createGroup
);

// Update group conversation
conversationRouter.put(
    '/:conversationId',
    validateMultiple({
        params: updateGroupSchema.shape.params,
        body: updateGroupSchema.shape.body,
    }),
    controller.updateConversation
);

// Add participants to group
conversationRouter.post(
    '/:conversationId/participants',
    validateMultiple({
        params: addParticipantsSchema.shape.params,
        body: addParticipantsSchema.shape.body,
    }),
    controller.addParticipants
);

// Remove participant from group
conversationRouter.delete(
    '/:conversationId/participants/:participantId',
    validate(removeParticipantSchema.shape.params, 'params'),
    controller.removeParticipant
);

// Update participant role
conversationRouter.patch(
    '/:conversationId/participants/:participantId/role',
    validateMultiple({
        params: updateParticipantRoleSchema.shape.params,
        body: updateParticipantRoleSchema.shape.body,
    }),
    controller.updateParticipantRole
);

// Mute/unmute conversation
conversationRouter.post(
    '/:conversationId/mute',
    validateMultiple({
        params: muteConversationSchema.shape.params,
        body: muteConversationSchema.shape.body,
    }),
    controller.muteConversation
);

// Archive conversation
conversationRouter.post(
    '/:conversationId/archive',
    validate(archiveConversationSchema.shape.params, 'params'),
    controller.archiveConversation
);

// Leave group
conversationRouter.post(
    '/:conversationId/leave',
    validate(leaveGroupSchema.shape.params, 'params'),
    controller.leaveGroup
);

// Delete conversation
conversationRouter.delete(
    '/:conversationId',
    validate(getConversationSchema.shape.params, 'params'),
    controller.deleteConversation
);

export { conversationRouter };
