import express from 'express';
import { protect as authenticate } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { logger } from '../utils/logger.js';
import { sanitizeInput } from '../validators/authValidators.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// All user routes require authentication
router.use(authenticate);

// Get user dashboard data
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let dashboardData = {
      user: req.user.toJSON(),
      profile: null,
      stats: {}
    };

    if (userRole === 'influencer') {
      const profile = await InfluencerProfile.findOne({ userId });
      if (profile) {
        dashboardData.profile = profile.toJSON();
        dashboardData.stats = {
          totalFollowers: profile.stats.totalFollowers,
          averageEngagement: profile.stats.averageEngagementRate,
          campaignsCompleted: profile.stats.campaignsCompleted,
          totalEarnings: profile.stats.totalEarnings,
          rating: profile.stats.rating,
          totalReviews: profile.stats.totalReviews,
          portfolioItems: profile.portfolio.length,
          availability: profile.availability.status
        };
      }
    } else if (userRole === 'business') {
      const profile = await BusinessProfile.findOne({ userId });
      if (profile) {
        dashboardData.profile = profile.toJSON();
        dashboardData.stats = {
          campaignsPosted: profile.stats.campaignsPosted,
          campaignsCompleted: profile.stats.campaignsCompleted,
          totalSpent: profile.stats.totalSpent,
          averageRating: profile.stats.averageRating,
          totalReviews: profile.stats.totalReviews,
          responseRate: profile.stats.responseRate,
          subscriptionPlan: profile.subscription.plan,
          subscriptionStatus: profile.subscriptionStatus
        };
      }
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Get dashboard data error:', error);
    next(error);
  }
};

// Get user activity/notifications
const getUserActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // This is a placeholder for future implementation
    // In a real application, you would have an Activity/Notification model
    const activities = [
      {
        id: '1',
        type: 'profile_update',
        message: 'Profile updated successfully',
        timestamp: new Date(),
        read: false
      },
      {
        id: '2',
        type: 'welcome',
        message: 'Welcome to the Upsale-it platform!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true
      }
    ];

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const totalCount = activities.length;

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Get user activity error:', error);
    next(error);
  }
};

// Get user statistics
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {
      accountCreated: req.user.createdAt,
      lastLogin: req.user.lastLogin,
      emailVerified: req.user.isEmailVerified,
      profileExists: false,
      profileComplete: false
    };

    if (userRole === 'influencer') {
      const profile = await InfluencerProfile.findOne({ userId });
      if (profile) {
        stats.profileExists = true;
        stats.profileComplete = profile.isProfileComplete;
        stats.totalFollowers = profile.stats.totalFollowers;
        stats.averageEngagement = profile.stats.averageEngagementRate;
        stats.campaignsCompleted = profile.stats.campaignsCompleted;
        stats.rating = profile.stats.rating;
        stats.isVerified = profile.verificationStatus.isVerified;
      }
    } else if (userRole === 'business') {
      const profile = await BusinessProfile.findOne({ userId });
      if (profile) {
        stats.profileExists = true;
        stats.profileComplete = profile.isProfileComplete;
        stats.campaignsPosted = profile.stats.campaignsPosted;
        stats.campaignsCompleted = profile.stats.campaignsCompleted;
        stats.totalSpent = profile.stats.totalSpent;
        stats.averageRating = profile.stats.averageRating;
        stats.subscriptionPlan = profile.subscription.plan;
        stats.isVerified = profile.verificationStatus.isVerified;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        stats,
        userRole
      }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    next(error);
  }
};

// Get user preferences
const getUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let preferences = {
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false
      },
      privacy: {
        profileVisibility: 'public',
        allowDirectMessages: true
      }
    };

    if (userRole === 'business') {
      const profile = await BusinessProfile.findOne({ userId });
      if (profile && profile.preferences) {
        preferences = {
          ...preferences,
          ...profile.preferences
        };
      }
    } else if (userRole === 'influencer') {
      const profile = await InfluencerProfile.findOne({ userId });
      if (profile && profile.preferences) {
        preferences = {
          ...preferences,
          ...profile.preferences
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        preferences,
        userRole
      }
    });
  } catch (error) {
    logger.error('Get user preferences error:', error);
    next(error);
  }
};

// Update user preferences
const updateUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { preferences } = req.body;

    if (userRole === 'business') {
      await BusinessProfile.findOneAndUpdate(
        { userId },
        { preferences },
        { new: true, upsert: false }
      );
    } else if (userRole === 'influencer') {
      await InfluencerProfile.findOneAndUpdate(
        { userId },
        { preferences },
        { new: true, upsert: false }
      );
    }

    logger.info(`Preferences updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences
      }
    });
  } catch (error) {
    logger.error('Update user preferences error:', error);
    next(error);
  }
};

// Routes
router.get('/dashboard', getDashboardData);
router.get('/activity', getUserActivity);
router.get('/stats', getUserStats);
router.get('/preferences', getUserPreferences);
router.put('/preferences', updateUserPreferences);

export default router;