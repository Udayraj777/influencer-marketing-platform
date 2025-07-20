import express from 'express';
import {
  createProfile,
  getProfile,
  updateProfile,
  updateProfileStep,
  getBusinesses,
  searchBusinesses,
  updateSubscription,
  getBusinessStats,
  updateCampaignPreferences,
  updateMatchingPreferences,
  getRecommendedInfluencers,
  updateNotificationPreferences,
  deleteProfile
} from '../controllers/businessProfileController.js';
import { protect as authenticate } from '../middleware/authMiddleware.js';
import {
  createBusinessProfileValidator,
  businessOnboardingStepValidator,
  subscriptionValidator,
  campaignPreferencesValidator,
  matchingPreferencesValidator,
  notificationPreferencesValidator,
  filterValidator,
  searchValidator,
  idValidator,
  validateBudgetRange,
  sanitizeInput
} from '../validators/profileValidators.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Public routes - anyone can view business profiles
router.get('/', filterValidator, getBusinesses);
router.get('/search', searchValidator, searchBusinesses);
router.get('/:id', idValidator, getProfile);

// Protected routes - require authentication
router.use(authenticate);

// Business-specific routes
router.post('/', createBusinessProfileValidator, createProfile);
router.put('/', createBusinessProfileValidator, updateProfile);
router.put('/onboarding/:step', businessOnboardingStepValidator, updateProfileStep); // New onboarding endpoint
router.get('/me/profile', getProfile);
router.get('/me/stats', getBusinessStats);
router.delete('/me/profile', deleteProfile);

// Subscription management
router.put('/me/subscription', subscriptionValidator, updateSubscription);

// Preferences management
router.put('/me/campaign-preferences', campaignPreferencesValidator, validateBudgetRange, updateCampaignPreferences);
router.put('/me/matching-preferences', matchingPreferencesValidator, updateMatchingPreferences);
router.put('/me/notification-preferences', notificationPreferencesValidator, updateNotificationPreferences);

// Influencer recommendations
router.get('/me/recommended-influencers', getRecommendedInfluencers);

export default router;