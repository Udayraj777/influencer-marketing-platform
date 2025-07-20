import express from 'express';
import {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  markAsRead,
  getConversationParticipants,
  getUnreadCount
} from '../controllers/conversationController.js';
import { protect as authenticate } from '../middleware/authMiddleware.js';
import { body, param, query } from 'express-validator';
import { sanitizeInput } from '../validators/authValidators.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// All conversation routes require authentication
router.use(authenticate);

// Validation middleware
const createConversationValidator = [
  body('participantId')
    .isMongoId()
    .withMessage('Invalid participant ID'),

  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),

  body('initialMessage')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Initial message cannot exceed 2000 characters')
];

const updateConversationValidator = [
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters')
];

const queryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const idValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID')
];

// Routes
router.get('/', queryValidator, getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:id', idValidator, getConversationById);
router.get('/:id/participants', idValidator, getConversationParticipants);

router.post('/', createConversationValidator, createConversation);
router.put('/:id', idValidator, updateConversationValidator, updateConversation);
router.delete('/:id', idValidator, deleteConversation);
router.post('/:id/mark-read', idValidator, markAsRead);

export default router;