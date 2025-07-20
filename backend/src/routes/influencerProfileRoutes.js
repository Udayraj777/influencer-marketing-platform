import express from 'express';
import {
  createProfile,
  getProfile,
  updateProfile,
  updateProfileStep,
  getInfluencers,
  searchInfluencers,
  addPortfolioItem,
  deletePortfolioItem,
  getInfluencerStats,
  updateAvailability,
  deleteProfile
} from '../controllers/influencerProfileController.js';
import { protect as authenticate } from '../middleware/authMiddleware.js';
import {
  createInfluencerProfileValidator,
  influencerOnboardingStepValidator,
  portfolioItemValidator,
  availabilityValidator,
  filterValidator,
  searchValidator,
  idValidator,
  validateFollowerRange,
  validateEngagementRange,
  sanitizeInput
} from '../validators/profileValidators.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Public routes - anyone can view influencer profiles
router.get('/', filterValidator, validateFollowerRange, validateEngagementRange, getInfluencers);
router.get('/search', searchValidator, searchInfluencers);
router.get('/:id', idValidator, getProfile);

// Protected routes - require authentication
router.use(authenticate);

// Influencer-specific routes
router.post('/', createInfluencerProfileValidator, createProfile);
router.put('/', createInfluencerProfileValidator, updateProfile);
router.put('/onboarding/:step', influencerOnboardingStepValidator, updateProfileStep); // New onboarding endpoint
router.get('/me/profile', getProfile);
router.get('/me/stats', getInfluencerStats);
router.put('/me/availability', availabilityValidator, updateAvailability);
router.delete('/me/profile', deleteProfile);

// Portfolio management
router.post('/me/portfolio', portfolioItemValidator, addPortfolioItem);
router.delete('/me/portfolio/:itemId', idValidator, deletePortfolioItem);

export default router;