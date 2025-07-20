import express from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  applyToCampaign,
  getBusinessCampaigns,
  getInfluencerApplications
} from '../controllers/campaignController.js';
import { protect as authenticate } from '../middleware/authMiddleware.js';
import { body, param, query } from 'express-validator';
import { sanitizeInput } from '../validators/authValidators.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Campaign creation validation
const createCampaignValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Campaign title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Campaign description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('category')
    .isIn(['sponsored_post', 'story', 'video', 'reel', 'collaboration', 'review', 'giveaway', 'takeover'])
    .withMessage('Invalid campaign category'),

  body('budget.amount')
    .isFloat({ min: 0 })
    .withMessage('Budget amount must be a positive number'),

  body('budget.currency')
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'])
    .withMessage('Invalid currency'),

  body('requirements.followerCount.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum follower count must be a non-negative integer'),

  body('requirements.followerCount.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum follower count must be a non-negative integer'),

  body('requirements.engagementRate.min')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Minimum engagement rate must be between 0 and 100'),

  body('applicationDeadline')
    .isISO8601()
    .toDate()
    .withMessage('Invalid application deadline'),

  body('campaignStartDate')
    .isISO8601()
    .toDate()
    .withMessage('Invalid campaign start date'),

  body('campaignEndDate')
    .isISO8601()
    .toDate()
    .withMessage('Invalid campaign end date')
];

// Campaign application validation
const applyToCampaignValidator = [
  body('proposalMessage')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Proposal message cannot exceed 1000 characters'),

  body('proposedRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Proposed rate must be a positive number')
];

// Query validation
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

// ID validation
const idValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid campaign ID')
];

// Public routes
router.get('/', queryValidator, getCampaigns);
router.get('/:id', idValidator, getCampaignById);

// Protected routes
router.use(authenticate);

// Campaign management
router.post('/', createCampaignValidator, createCampaign);
router.put('/:id', idValidator, createCampaignValidator, updateCampaign);
router.delete('/:id', idValidator, deleteCampaign);

// Campaign applications
router.post('/:id/apply', idValidator, applyToCampaignValidator, applyToCampaign);

// User-specific routes
router.get('/business/my-campaigns', queryValidator, getBusinessCampaigns);
router.get('/influencer/my-applications', queryValidator, getInfluencerApplications);

export default router;