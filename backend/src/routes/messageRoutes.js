import express from 'express';
import {
  sendMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount,
  searchMessages
} from '../controllers/messageController.js';
import { protect as authenticate } from '../middleware/authMiddleware.js';
import { body, param, query } from 'express-validator';
import { sanitizeInput } from '../validators/authValidators.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// All message routes require authentication
router.use(authenticate);

// Validation middleware
const sendMessageValidator = [
  body('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message content cannot exceed 2000 characters'),

  body('type')
    .optional()
    .isIn(['text', 'image', 'file', 'voice'])
    .withMessage('Invalid message type')
];

const updateMessageValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message content cannot exceed 2000 characters')
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

const searchValidator = [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),

  query('conversationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid conversation ID'),

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
    .withMessage('Invalid message ID')
];

const conversationIdValidator = [
  param('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID')
];

// Routes
router.post('/', sendMessageValidator, sendMessage);
router.get('/search', searchValidator, searchMessages);
router.get('/unread-count', getUnreadCount);
router.get('/conversation/:conversationId', conversationIdValidator, queryValidator, getMessages);
router.get('/:id', idValidator, getMessageById);

router.put('/:id', idValidator, updateMessageValidator, updateMessage);
router.delete('/:id', idValidator, deleteMessage);
router.post('/:id/mark-read', idValidator, markAsRead);

export default router;