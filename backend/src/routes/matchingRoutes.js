import express from 'express';
import {
  findInfluencerMatches,
  findBusinessMatches,
  getMatchingStats
} from '../controllers/matchingController.js';
import { protect as authenticate } from '../middleware/authMiddleware.js';
import { query } from 'express-validator';
import { sanitizeInput } from '../validators/authValidators.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// All matching routes require authentication
router.use(authenticate);

// Matching validation middleware
const matchingQueryValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('minScore')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Minimum score must be between 0 and 1'),

  query('includeUnavailable')
    .optional()
    .isBoolean()
    .withMessage('Include unavailable must be a boolean')
];

// Find influencer matches for businesses
router.get('/influencers', matchingQueryValidator, findInfluencerMatches);

// Find business matches for influencers
router.get('/businesses', matchingQueryValidator, findBusinessMatches);

// Get matching statistics
router.get('/stats', getMatchingStats);

export default router;