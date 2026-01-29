import { Router } from 'express';
import { conversationRouter } from './conversation.routes';
import { messageRouter } from './message.routes';
import { authenticate } from '../middlewares';

const router = Router();

// All routes below require authentication
router.use(authenticate);

router.use('/conversations', conversationRouter);
router.use('/messages', messageRouter);

export { router };
