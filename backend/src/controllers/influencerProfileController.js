import { validationResult } from 'express-validator';
import InfluencerProfile from '../models/InfluencerProfile.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Create influencer profile
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

    // Check if user is an influencer
    if (req.user.role !== 'influencer') {
      return res.status(403).json({
        success: false,
        message: 'Only influencers can create influencer profiles'
      });
    }

    // Check if profile already exists
    const existingProfile = await InfluencerProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Influencer profile already exists'
      });
    }

    // Create new influencer profile with required fields
    const profile = new InfluencerProfile({
      userId,
      isActive: true,
      availability: { status: 'available' },
      ...req.body
    });

    // Debug: Log profile before saving
    console.log('Creating influencer profile:', JSON.stringify(profile, null, 2));

    await profile.save();

    // Update user's profileId and profileModel
    await User.findByIdAndUpdate(userId, { 
      profileId: profile._id,
      profileModel: 'InfluencerProfile'
    });

    // Debug: Log created profile
    console.log('Created influencer profile:', JSON.stringify(profile.toObject(), null, 2));
    logger.info(`Influencer profile created for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Influencer profile created successfully',
      data: {
        profile: profile.toJSON()
      }
    });
  } catch (error) {
    logger.error('Create influencer profile error:', error);
    next(error);
  }
};

// Create or update profile step by step (for onboarding)
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

    // Check if user is an influencer
    if (req.user.role !== 'influencer') {
      return res.status(403).json({
        success: false,
        message: 'Only influencers can update influencer profiles'
      });
    }

    // Find existing profile or create new one
    let profile = await InfluencerProfile.findOne({ userId });
    if (!profile) {
      profile = new InfluencerProfile({ userId });
    }

    // Update profile based on step
    switch (step) {
      case '1':
        // Basic info and bio
        const { bio, location, niches, audienceDescription } = req.body;
        if (bio) profile.bio = bio;
        if (location) profile.location = { ...profile.location, ...location };
        if (niches) profile.niches = niches;
        if (audienceDescription) profile.audienceDescription = audienceDescription;
        break;

      case '2':
        // Social media links
        const { socialLinks } = req.body;
        if (socialLinks) profile.socialLinks = socialLinks;
        break;

      case '3':
        // Audience demographics and insights
        const { demographics, rates } = req.body;
        if (demographics) profile.demographics = { ...profile.demographics, ...demographics };
        if (rates) profile.rates = { ...profile.rates, ...rates };
        break;

      case '4':
        // Preferences and availability
        const { preferences, availability } = req.body;
        if (preferences) profile.preferences = { ...profile.preferences, ...preferences };
        if (availability) profile.availability = { ...profile.availability, ...availability };
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

    logger.info(`Influencer profile step ${step} updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `Profile step ${step} updated successfully`,
      data: {
        profile: profile.toJSON(),
        isComplete: profile.isProfileComplete,
        completionPercentage: calculateCompletionPercentage(profile)
      }
    });
  } catch (error) {
    logger.error('Update influencer profile step error:', error);
    next(error);
  }
};

// Get influencer profile
export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = id || req.user._id;

    const profile = await InfluencerProfile.findOne({ userId }).populate('userId', 'name email createdAt');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        profile: profile.toJSON()
      }
    });
  } catch (error) {
    logger.error('Get influencer profile error:', error);
    next(error);
  }
};

// Update influencer profile
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

    // Check if user is an influencer
    if (req.user.role !== 'influencer') {
      return res.status(403).json({
        success: false,
        message: 'Only influencers can update influencer profiles'
      });
    }

    const profile = await InfluencerProfile.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    logger.info(`Influencer profile updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Influencer profile updated successfully',
      data: {
        profile: profile.toJSON()
      }
    });
  } catch (error) {
    logger.error('Update influencer profile error:', error);
    next(error);
  }
};

// Get all influencer profiles (with filtering and pagination)
export const getInfluencers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      niche,
      country,
      state,
      minFollowers,
      maxFollowers,
      minEngagement,
      maxEngagement,
      verified,
      availability,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (niche) {
      filter.niches = { $in: Array.isArray(niche) ? niche : [niche] };
    }

    if (country) {
      filter['location.country'] = country;
    }

    if (state) {
      filter['location.state'] = state;
    }

    if (minFollowers || maxFollowers) {
      filter['stats.totalFollowers'] = {};
      if (minFollowers) filter['stats.totalFollowers'].$gte = parseInt(minFollowers);
      if (maxFollowers) filter['stats.totalFollowers'].$lte = parseInt(maxFollowers);
    }

    if (minEngagement || maxEngagement) {
      filter['stats.averageEngagementRate'] = {};
      if (minEngagement) filter['stats.averageEngagementRate'].$gte = parseFloat(minEngagement);
      if (maxEngagement) filter['stats.averageEngagementRate'].$lte = parseFloat(maxEngagement);
    }

    if (verified !== undefined) {
      filter['verificationStatus.isVerified'] = verified === 'true';
    }

    if (availability) {
      filter['availability.status'] = availability;
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
      InfluencerProfile.find(filter)
        .populate('userId', 'name email createdAt')
        .sort(sort)
        .skip(skip)
        .limit(pageSize),
      InfluencerProfile.countDocuments(filter)
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
    logger.error('Get influencers error:', error);
    next(error);
  }
};

// Search influencers
export const searchInfluencers = async (req, res, next) => {
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
        { bio: searchRegex },
        { audienceDescription: searchRegex },
        { niches: { $in: [searchRegex] } },
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
      InfluencerProfile.find(filter)
        .populate('userId', 'name email')
        .sort({ 'stats.totalFollowers': -1 })
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
    logger.error('Search influencers error:', error);
    next(error);
  }
};

// Add portfolio item
export const addPortfolioItem = async (req, res, next) => {
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
    const profile = await InfluencerProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    profile.addPortfolioItem(req.body);
    await profile.save();

    logger.info(`Portfolio item added for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Portfolio item added successfully',
      data: {
        portfolioItem: profile.portfolio[profile.portfolio.length - 1]
      }
    });
  } catch (error) {
    logger.error('Add portfolio item error:', error);
    next(error);
  }
};

// Delete portfolio item
export const deletePortfolioItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const profile = await InfluencerProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    const portfolioItem = profile.portfolio.id(itemId);
    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    profile.portfolio.pull(itemId);
    profile.updateEngagementRate();
    await profile.save();

    logger.info(`Portfolio item deleted for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    logger.error('Delete portfolio item error:', error);
    next(error);
  }
};

// Get influencer statistics
export const getInfluencerStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await InfluencerProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    // Calculate additional stats
    const stats = {
      ...profile.stats.toObject(),
      profileCompleteness: profile.isProfileComplete ? 100 : 75,
      portfolioItems: profile.portfolio.length,
      socialPlatforms: profile.socialLinks.length,
      topPlatform: profile.primarySocialPlatform?.platform || null,
      averageResponseTime: profile.availability.responseTime,
      weeklyCapacity: profile.availability.weeklyCapacity
    };

    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    logger.error('Get influencer stats error:', error);
    next(error);
  }
};

// Update availability
export const updateAvailability = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, weeklyCapacity, responseTime } = req.body;

    const profile = await InfluencerProfile.findOneAndUpdate(
      { userId },
      {
        'availability.status': status,
        'availability.weeklyCapacity': weeklyCapacity,
        'availability.responseTime': responseTime
      },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    logger.info(`Availability updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        availability: profile.availability
      }
    });
  } catch (error) {
    logger.error('Update availability error:', error);
    next(error);
  }
};

// Delete influencer profile
export const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const profile = await InfluencerProfile.findOneAndUpdate(
      { userId },
      { isActive: false },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    // Clear profileId from user
    await User.findByIdAndUpdate(userId, { profileId: null });

    logger.info(`Influencer profile deleted for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Influencer profile deleted successfully'
    });
  } catch (error) {
    logger.error('Delete influencer profile error:', error);
    next(error);
  }
};

// Helper function to calculate profile completion percentage
const calculateCompletionPercentage = (profile) => {
  const requiredFields = [
    'bio',
    'socialLinks',
    'niches',
    'audienceDescription',
    'location.country'
  ];
  
  let completedFields = 0;
  const totalFields = requiredFields.length;
  
  for (const field of requiredFields) {
    const value = field.includes('.') ? 
      field.split('.').reduce((obj, key) => obj && obj[key], profile) : 
      profile[field];
    
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completedFields++;
    }
  }
  
  // Additional checks for social links
  if (profile.socialLinks && profile.socialLinks.length > 0) {
    completedFields += 0.5; // Bonus for having social links
  }
  
  // Additional checks for rates
  if (profile.rates && (profile.rates.postRate > 0 || profile.rates.storyRate > 0)) {
    completedFields += 0.5; // Bonus for having rates
  }
  
  return Math.min(Math.round((completedFields / totalFields) * 100), 100);
};