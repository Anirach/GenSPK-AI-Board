import express from 'express';
import { body } from 'express-validator';
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  addMessage,
  getMessages,
  deleteMessage
} from '../controllers/conversationController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createConversationValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Conversation title is required and must not exceed 200 characters'),
  body('context')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Context cannot exceed 1000 characters'),
  body('boardId')
    .notEmpty()
    .isString()
    .withMessage('Board ID is required and must be a string')
];

const updateConversationValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Conversation title must not exceed 200 characters'),
  body('context')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Context cannot exceed 1000 characters')
];

const addMessageValidation = [
  body('content')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content is required and must not exceed 5000 characters'),
  body('type')
    .optional()
    .isIn(['USER', 'PERSONA', 'SYSTEM'])
    .withMessage('Message type must be USER, PERSONA, or SYSTEM'),
  body('personaId')
    .optional()
    .isString()
    .withMessage('Persona ID must be a string')
];

// Routes
router.get('/', authenticate, getConversations);
router.get('/:id', authenticate, getConversation);
router.post('/', authenticate, createConversationValidation, validate, createConversation);
router.put('/:id', authenticate, updateConversationValidation, validate, updateConversation);
router.delete('/:id', authenticate, deleteConversation);

// Message routes
router.get('/:id/messages', authenticate, getMessages);
router.post('/:id/messages', authenticate, addMessageValidation, validate, addMessage);
router.delete('/:id/messages/:messageId', authenticate, deleteMessage);

export default router;