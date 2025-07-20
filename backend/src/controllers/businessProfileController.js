import { validationResult } from 'express-validator';
import BusinessProfile from '../models/BusinessProfile.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Create business profile
export const createProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;

    // Check if user is a business
    if (req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can create business profiles'
      });
    }

    // Check if profile already exists
    const existingProfile = await BusinessProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Business profile already exists'
      });
    }

    // Create new business profile
    const profile = new BusinessProfile({
      userId,
      ...req.body
    });

    await profile.save();

    // Update user's profileId
    await User.findByIdAndUpdate(userId, { profileId: profile._id });

    logger.info(`Business profile created for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Business profile created successfully',
      data: {
        profile: profile.toJSON()
      }
    });
  } catch (error) {
    logger.error('Create business profile error:', error);
    next(error);
  }
};

// Create or update business profile step by step (for onboarding)
export const updateProfileStep = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { step } = req.params;

    // Check if user is a business
    if (req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can update business profiles'
      });
    }

    // Find existing profile or create new one
    let profile = await BusinessProfile.findOne({ userId });
    if (!profile) {
      profile = new BusinessProfile({ userId });
    }

    // Update profile based on step
    switch (step) {
      case '1':
        // Company information
        const { companyName, description, industry, companySize, website } = req.body;
        if (companyName) profile.companyName = companyName;
        if (description) profile.description = description;
        if (industry) profile.industry = industry;
        if (companySize) profile.companySize = companySize;
        if (website) profile.website = website;
        break;

      case '2':
        // Location and contact info
        const { location, contactInfo } = req.body;
        if (location) profile.location = { ...profile.location, ...location };
        if (contactInfo) profile.contactInfo = { ...profile.contactInfo, ...contactInfo };
        break;

      case '3':
        // Target audience and ideal customer profile
        const { targetAudience, idealCustomerProfile } = req.body;
        if (targetAudience) profile.targetAudience = { ...profile.targetAudience, ...targetAudience };
        if (idealCustomerProfile) profile.idealCustomerProfile = idealCustomerProfile;
        break;

      case '4':
        // Campaign preferences and budget
        const { campaignPreferences, preferences } = req.body;
        if (campaignPreferences) profile.campaignPreferences = { ...profile.campaignPreferences, ...campaignPreferences };
        if (preferences) profile.preferences = { ...profile.preferences, ...preferences };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid step number'
        });
    }

    await profile.save();

    // Update user's profileId if it's a new profile
    if (!req.user.profileId) {
      await User.findByIdAndUpdate(userId, { profileId: profile._id });
    }

    logger.info(`Business profile step ${step} updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `Profile step ${step} updated successfully`,
      data: {
        profile: profile.toJSON(),
        isComplete: profile.isProfileComplete,
        completionPercentage: calculateBusinessCompletionPercentage(profile)
      }
    });
  } catch (error) {
    logger.error('Update business profile step error:', error);
    next(error);
  }
};

// Get business profile
export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = id || req.user._id;

    const profile = await BusinessProfile.findOne({ userId }).populate('userId', 'name email createdAt');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        profile: profile.toJSON()
      }
    });
  } catch (error) {
    logger.error('Get business profile error:', error);
    next(error);
  }
};

// Update business profile
export const updateProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;

    // Check if user is a business
    if (req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can update business profiles'
      });
    }

    const profile = await BusinessProfile.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    logger.info(`Business profile updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Business profile updated successfully',
      data: {
        profile: profile.toJSON()
      }
    });
  } catch (error) {
    logger.error('Update business profile error:', error);
    next(error);
  }
};

// Get all business profiles (with filtering and pagination)
export const getBusinesses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      industry,
      country,
      state,
      companySize,
      verified,
      subscription,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (industry) {
      filter.industry = { $in: Array.isArray(industry) ? industry : [industry] };
    }

    if (country) {
      filter['location.country'] = country;
    }

    if (state) {
      filter['location.state'] = state;
    }

    if (companySize) {
      filter.companySize = companySize;
    }

    if (verified !== undefined) {
      filter['verificationStatus.isVerified'] = verified === 'true';
    }

    if (subscription) {
      filter['subscription.plan'] = subscription;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Execute query
    const [profiles, totalCount] = await Promise.all([
      BusinessProfile.find(filter)
        .populate('userId', 'name email createdAt')
        .sort(sort)
        .skip(skip)
        .limit(pageSize),
      BusinessProfile.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.status(200).json({
      success: true,
      data: {
        profiles: profiles.map(p => p.toJSON()),
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Get businesses error:', error);
    next(error);
  }
};

// Search businesses
export const searchBusinesses = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const filter = {
      isActive: true,
      $or: [
        { companyName: searchRegex },
        { description: searchRegex },
        { industry: searchRegex },
        { idealCustomerProfile: searchRegex },
        { 'location.city': searchRegex },
        { 'location.state': searchRegex },
        { 'location.country': searchRegex }
      ]
    };

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Execute query
    const [profiles, totalCount] = await Promise.all([
      BusinessProfile.find(filter)
        .populate('userId', 'name email')
        .sort({ 'stats.averageRating': -1 })
        .skip(skip)
        .limit(pageSize),
      BusinessProfile.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        profiles: profiles.map(p => p.toJSON()),
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Search businesses error:', error);
    next(error);
  }
};

// Update subscription
export const updateSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { plan, duration } = req.body;

    const profile = await BusinessProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    profile.updateSubscription(plan, duration);
    await profile.save();

    logger.info(`Subscription updated for user: ${req.user.email} to ${plan}`);

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        subscription: profile.subscription
      }
    });
  } catch (error) {
    logger.error('Update subscription error:', error);
    next(error);
  }
};

// Get business statistics
export const getBusinessStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await BusinessProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    // Calculate additional stats
    const stats = {
      ...profile.stats.toObject(),
      profileCompleteness: profile.isProfileComplete ? 100 : 75,
      completionRate: profile.completionRate,
      subscriptionStatus: profile.subscriptionStatus,
      subscriptionPlan: profile.subscription.plan,
      activeFeatures: Object.keys(profile.subscription.features).filter(
        key => profile.subscription.features[key] === true
      ),
      remainingCampaigns: profile.subscription.features.maxActiveCampaigns === -1 
        ? 'unlimited' 
        : Math.max(0, profile.subscription.features.maxActiveCampaigns - profile.stats.campaignsPosted)
    };

    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    logger.error('Get business stats error:', error);
    next(error);
  }
};

// Update campaign preferences
export const updateCampaignPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;

    const profile = await BusinessProfile.findOneAndUpdate(
      { userId },
      { campaignPreferences: preferences },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    logger.info(`Campaign preferences updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Campaign preferences updated successfully',
      data: {
        campaignPreferences: profile.campaignPreferences
      }
    });
  } catch (error) {
    logger.error('Update campaign preferences error:', error);
    next(error);
  }
};

// Update matching preferences
export const updateMatchingPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const matchingPreferences = req.body;

    const profile = await BusinessProfile.findOneAndUpdate(
      { userId },
      { 'preferences.matching': matchingPreferences },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    logger.info(`Matching preferences updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Matching preferences updated successfully',
      data: {
        matchingPreferences: profile.preferences.matching
      }
    });
  } catch (error) {
    logger.error('Update matching preferences error:', error);
    next(error);
  }
};

// Get recommended influencers based on business profile
export const getRecommendedInfluencers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const businessProfile = await BusinessProfile.findOne({ userId });

    if (!businessProfile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    // This is a placeholder - the actual matching algorithm will be implemented separately
    const matchingCriteria = businessProfile.preferences.matching.matchingCriteria;
    const targetAudience = businessProfile.targetAudience;

    // Build filter based on business preferences
    const filter = {
      isActive: true,
      'availability.status': 'available'
    };

    if (matchingCriteria.verifiedOnly) {
      filter['verificationStatus.isVerified'] = true;
    }

    if (matchingCriteria.minFollowers) {
      filter['stats.totalFollowers'] = { $gte: matchingCriteria.minFollowers };
    }

    if (matchingCriteria.maxFollowers) {
      filter['stats.totalFollowers'] = { ...filter['stats.totalFollowers'], $lte: matchingCriteria.maxFollowers };
    }

    if (matchingCriteria.minEngagementRate) {
      filter['stats.averageEngagementRate'] = { $gte: matchingCriteria.minEngagementRate };
    }

    if (targetAudience.demographics.interests.length > 0) {
      filter.niches = { $in: targetAudience.demographics.interests };
    }

    if (targetAudience.geography.countries.length > 0) {
      filter['location.country'] = { $in: targetAudience.geography.countries };
    }

    if (targetAudience.platforms.length > 0) {
      filter['socialLinks.platform'] = { $in: targetAudience.platforms };
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Execute query with scoring based on match
    const InfluencerProfile = (await import('../models/InfluencerProfile.js')).default;
    const [profiles, totalCount] = await Promise.all([
      InfluencerProfile.find(filter)
        .populate('userId', 'name email')
        .sort({ 'stats.rating': -1, 'stats.totalFollowers': -1 })
        .skip(skip)
        .limit(pageSize),
      InfluencerProfile.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        profiles: profiles.map(p => p.toJSON()),
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Get recommended influencers error:', error);
    next(error);
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notificationPreferences = req.body;

    const profile = await BusinessProfile.findOneAndUpdate(
      { userId },
      { 'preferences.notifications': notificationPreferences },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    logger.info(`Notification preferences updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        notificationPreferences: profile.preferences.notifications
      }
    });
  } catch (error) {
    logger.error('Update notification preferences error:', error);
    next(error);
  }
};

// Delete business profile
export const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const profile = await BusinessProfile.findOneAndUpdate(
      { userId },
      { isActive: false },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    // Clear profileId from user
    await User.findByIdAndUpdate(userId, { profileId: null });

    logger.info(`Business profile deleted for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Business profile deleted successfully'
    });
  } catch (error) {
    logger.error('Delete business profile error:', error);
    next(error);
  }
};

// Helper function to calculate business profile completion percentage
const calculateBusinessCompletionPercentage = (profile) => {
  const requiredFields = [
    'companyName',
    'industry',
    'companySize',
    'location.country',
    'contactInfo.primaryContact.name',
    'contactInfo.primaryContact.email'
  ];
  
  let completedFields = 0;
  const totalFields = requiredFields.length;
  
  for (const field of requiredFields) {
    const value = field.includes('.') ? 
      field.split('.').reduce((obj, key) => obj && obj[key], profile) : 
      profile[field];
    
    if (value && value.toString().trim().length > 0) {
      completedFields++;
    }
  }
  
  // Additional checks for optional but important fields
  if (profile.description && profile.description.trim().length > 0) {
    completedFields += 0.5; // Bonus for company description
  }
  
  if (profile.website && profile.website.trim().length > 0) {
    completedFields += 0.5; // Bonus for website
  }
  
  if (profile.targetAudience && profile.targetAudience.demographics.interests.length > 0) {
    completedFields += 0.5; // Bonus for target audience
  }
  
  return Math.min(Math.round((completedFields / totalFields) * 100), 100);
};