import { body, query, param } from 'express-validator';

// Onboarding step validators for influencers
export const influencerOnboardingStepValidator = [
  param('step')
    .isIn(['1', '2', '3', '4'])
    .withMessage('Invalid step number. Must be 1, 2, 3, or 4'),

  // Step 1: Basic info and bio
  body('bio')
    .if(param('step').equals('1'))
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('location.country')
    .if(param('step').equals('1'))
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('niches')
    .if(param('step').equals('1'))
    .optional()
    .isArray({ min: 1, max: 5 })
    .withMessage('Select 1-5 niches'),

  body('audienceDescription')
    .if(param('step').equals('1'))
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Audience description cannot exceed 300 characters'),

  // Step 2: Social media links
  body('socialLinks')
    .if(param('step').equals('2'))
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one social media link is required'),

  body('socialLinks.*.platform')
    .if(param('step').equals('2'))
    .isIn(['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'twitch', 'pinterest'])
    .withMessage('Invalid social media platform'),

  body('socialLinks.*.url')
    .if(param('step').equals('2'))
    .isURL()
    .withMessage('Invalid URL format'),

  body('socialLinks.*.followers')
    .if(param('step').equals('2'))
    .isInt({ min: 0 })
    .withMessage('Followers count must be a non-negative integer'),

  // Step 3: Demographics and rates
  body('rates.postRate')
    .if(param('step').equals('3'))
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Post rate must be a non-negative number'),

  body('rates.storyRate')
    .if(param('step').equals('3'))
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Story rate must be a non-negative number'),

  body('rates.videoRate')
    .if(param('step').equals('3'))
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Video rate must be a non-negative number'),

  // Step 4: Preferences and availability
  body('availability.status')
    .if(param('step').equals('4'))
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability status'),

  body('availability.weeklyCapacity')
    .if(param('step').equals('4'))
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Weekly capacity must be between 1 and 20'),

  body('availability.responseTime')
    .if(param('step').equals('4'))
    .optional()
    .isIn(['within_hour', 'within_day', 'within_week'])
    .withMessage('Invalid response time')
];

// Onboarding step validators for businesses
export const businessOnboardingStepValidator = [
  param('step')
    .isIn(['1', '2', '3', '4'])
    .withMessage('Invalid step number. Must be 1, 2, 3, or 4'),

  // Step 1: Company information
  body('companyName')
    .if(param('step').equals('1'))
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),

  body('description')
    .if(param('step').equals('1'))
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('industry')
    .if(param('step').equals('1'))
    .optional()
    .isIn([
      'fashion', 'beauty', 'fitness', 'food', 'travel', 'technology',
      'gaming', 'music', 'art', 'education', 'business', 'finance',
      'health', 'parenting', 'pets', 'sports', 'automotive', 'home',
      'sustainability', 'luxury', 'e_commerce', 'saas', 'consulting',
      'real_estate', 'entertainment', 'non_profit', 'government', 'other'
    ])
    .withMessage('Invalid industry selected'),

  body('companySize')
    .if(param('step').equals('1'))
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),

  body('website')
    .if(param('step').equals('1'))
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),

  // Step 2: Location and contact info
  body('location.country')
    .if(param('step').equals('2'))
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('contactInfo.primaryContact.name')
    .if(param('step').equals('2'))
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Primary contact name is required'),

  body('contactInfo.primaryContact.email')
    .if(param('step').equals('2'))
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),

  // Step 3: Target audience
  body('targetAudience.demographics.ageRanges')
    .if(param('step').equals('3'))
    .optional()
    .isArray()
    .withMessage('Age ranges must be an array'),

  body('targetAudience.demographics.interests')
    .if(param('step').equals('3'))
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),

  body('idealCustomerProfile')
    .if(param('step').equals('3'))
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ideal customer profile cannot exceed 500 characters'),

  // Step 4: Campaign preferences
  body('campaignPreferences.budgetRange.min')
    .if(param('step').equals('4'))
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum budget must be a non-negative number'),

  body('campaignPreferences.budgetRange.max')
    .if(param('step').equals('4'))
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum budget must be a non-negative number'),

  body('campaignPreferences.preferredCampaignTypes')
    .if(param('step').equals('4'))
    .optional()
    .isArray()
    .withMessage('Preferred campaign types must be an array')
];

// Influencer profile validation
export const createInfluencerProfileValidator = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('socialLinks')
    .isArray({ min: 1 })
    .withMessage('At least one social media link is required'),

  body('socialLinks.*.platform')
    .isIn(['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'twitch', 'pinterest'])
    .withMessage('Invalid social media platform'),

  body('socialLinks.*.url')
    .isURL()
    .withMessage('Invalid URL format'),

  body('socialLinks.*.username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),

  body('socialLinks.*.followers')
    .isInt({ min: 0 })
    .withMessage('Followers count must be a non-negative integer'),

  body('niches')
    .isArray({ min: 1, max: 5 })
    .withMessage('Select 1-5 niches'),

  body('niches.*')
    .isIn([
      'lifestyle', 'fashion', 'beauty', 'fitness', 'food', 'travel',
      'technology', 'gaming', 'music', 'art', 'photography', 'comedy',
      'education', 'business', 'finance', 'health', 'parenting', 'pets',
      'sports', 'automotive', 'home', 'diy', 'books', 'movies',
      'sustainability', 'outdoors', 'luxury', 'budget', 'productivity'
    ])
    .withMessage('Invalid niche selected'),

  body('audienceDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Audience description cannot exceed 300 characters'),

  body('location.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters'),

  body('location.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name cannot exceed 100 characters'),

  body('rates.postRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Post rate must be a non-negative number'),

  body('rates.storyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Story rate must be a non-negative number'),

  body('rates.videoRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Video rate must be a non-negative number'),

  body('rates.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'])
    .withMessage('Invalid currency')
];

// Business profile validation
export const createBusinessProfileValidator = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('website')
    .optional()
    .isURL()
    .withMessage('Invalid website URL'),

  body('industry')
    .isIn([
      'fashion', 'beauty', 'fitness', 'food', 'travel', 'technology',
      'gaming', 'music', 'art', 'education', 'business', 'finance',
      'health', 'parenting', 'pets', 'sports', 'automotive', 'home',
      'sustainability', 'luxury', 'e_commerce', 'saas', 'consulting',
      'real_estate', 'entertainment', 'non_profit', 'government', 'other'
    ])
    .withMessage('Invalid industry selected'),

  body('companySize')
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),

  body('location.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters'),

  body('location.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name cannot exceed 100 characters'),

  body('contactInfo.primaryContact.name')
    .trim()
    .notEmpty()
    .withMessage('Primary contact name is required'),

  body('contactInfo.primaryContact.email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid primary contact email is required'),

  body('contactInfo.primaryContact.phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),

  body('idealCustomerProfile')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ideal customer profile cannot exceed 500 characters'),

  body('targetAudience.demographics.ageRanges')
    .optional()
    .isArray()
    .withMessage('Age ranges must be an array'),

  body('targetAudience.demographics.ageRanges.*')
    .optional()
    .isIn(['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'])
    .withMessage('Invalid age range'),

  body('targetAudience.demographics.interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),

  body('targetAudience.demographics.interests.*')
    .optional()
    .isIn([
      'lifestyle', 'fashion', 'beauty', 'fitness', 'food', 'travel',
      'technology', 'gaming', 'music', 'art', 'photography', 'comedy',
      'education', 'business', 'finance', 'health', 'parenting', 'pets',
      'sports', 'automotive', 'home', 'diy', 'books', 'movies',
      'sustainability', 'outdoors', 'luxury', 'budget', 'productivity'
    ])
    .withMessage('Invalid interest'),

  body('targetAudience.platforms')
    .optional()
    .isArray()
    .withMessage('Platforms must be an array'),

  body('targetAudience.platforms.*')
    .optional()
    .isIn(['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'twitch', 'pinterest'])
    .withMessage('Invalid platform')
];

// Portfolio item validation
export const portfolioItemValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description cannot exceed 300 characters'),

  body('imageUrl')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL'),

  body('campaignType')
    .isIn(['sponsored_post', 'story', 'video', 'reel', 'collaboration', 'review'])
    .withMessage('Invalid campaign type'),

  body('brandName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),

  body('metrics.views')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Views must be a non-negative integer'),

  body('metrics.likes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Likes must be a non-negative integer'),

  body('metrics.comments')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Comments must be a non-negative integer'),

  body('metrics.shares')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Shares must be a non-negative integer'),

  body('metrics.saves')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Saves must be a non-negative integer'),

  body('metrics.engagementRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Engagement rate must be between 0 and 100')
];

// Subscription validation
export const subscriptionValidator = [
  body('plan')
    .isIn(['free', 'basic', 'premium', 'enterprise'])
    .withMessage('Invalid subscription plan'),

  body('duration')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days')
];

// Availability validation
export const availabilityValidator = [
  body('status')
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability status'),

  body('weeklyCapacity')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Weekly capacity must be between 1 and 20'),

  body('responseTime')
    .optional()
    .isIn(['within_hour', 'within_day', 'within_week'])
    .withMessage('Invalid response time')
];

// Query parameter validation for filtering
export const filterValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('minFollowers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum followers must be a non-negative integer'),

  query('maxFollowers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum followers must be a non-negative integer'),

  query('minEngagement')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Minimum engagement must be between 0 and 100'),

  query('maxEngagement')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Maximum engagement must be between 0 and 100'),

  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'stats.totalFollowers', 'stats.averageEngagementRate', 'stats.rating'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Search validation
export const searchValidator = [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// ID parameter validation
export const idValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  param('itemId')
    .optional()
    .isMongoId()
    .withMessage('Invalid item ID format')
];

// Campaign preferences validation
export const campaignPreferencesValidator = [
  body('preferredCampaignTypes')
    .optional()
    .isArray()
    .withMessage('Preferred campaign types must be an array'),

  body('preferredCampaignTypes.*')
    .optional()
    .isIn(['sponsored_post', 'story', 'video', 'reel', 'collaboration', 'review', 'giveaway', 'takeover'])
    .withMessage('Invalid campaign type'),

  body('budgetRange.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum budget must be a non-negative number'),

  body('budgetRange.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum budget must be a non-negative number'),

  body('budgetRange.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'])
    .withMessage('Invalid currency'),

  body('collaborationStyle')
    .optional()
    .isIn(['hands_on', 'collaborative', 'hands_off'])
    .withMessage('Invalid collaboration style'),

  body('contentApproval')
    .optional()
    .isIn(['pre_approval', 'post_approval', 'no_approval'])
    .withMessage('Invalid content approval preference'),

  body('deliveryTimeline')
    .optional()
    .isIn(['within_week', 'within_month', 'flexible'])
    .withMessage('Invalid delivery timeline')
];

// Matching preferences validation
export const matchingPreferencesValidator = [
  body('autoMatchEnabled')
    .optional()
    .isBoolean()
    .withMessage('Auto match enabled must be a boolean'),

  body('matchingCriteria.minFollowers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum followers must be a non-negative integer'),

  body('matchingCriteria.maxFollowers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum followers must be a non-negative integer'),

  body('matchingCriteria.minEngagementRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Minimum engagement rate must be between 0 and 100'),

  body('matchingCriteria.verifiedOnly')
    .optional()
    .isBoolean()
    .withMessage('Verified only must be a boolean')
];

// Notification preferences validation
export const notificationPreferencesValidator = [
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),

  body('smsNotifications')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications must be a boolean'),

  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean'),

  body('weeklyDigest')
    .optional()
    .isBoolean()
    .withMessage('Weekly digest must be a boolean')
];

// Custom validation middleware for follower range
export const validateFollowerRange = (req, res, next) => {
  const { minFollowers, maxFollowers } = req.query;
  
  if (minFollowers && maxFollowers && parseInt(minFollowers) > parseInt(maxFollowers)) {
    return res.status(400).json({
      success: false,
      message: 'Minimum followers cannot be greater than maximum followers'
    });
  }
  
  next();
};

// Custom validation middleware for engagement range
export const validateEngagementRange = (req, res, next) => {
  const { minEngagement, maxEngagement } = req.query;
  
  if (minEngagement && maxEngagement && parseFloat(minEngagement) > parseFloat(maxEngagement)) {
    return res.status(400).json({
      success: false,
      message: 'Minimum engagement cannot be greater than maximum engagement'
    });
  }
  
  next();
};

// Custom validation middleware for budget range
export const validateBudgetRange = (req, res, next) => {
  const { budgetRange } = req.body;
  
  if (budgetRange && budgetRange.min && budgetRange.max && budgetRange.min > budgetRange.max) {
    return res.status(400).json({
      success: false,
      message: 'Minimum budget cannot be greater than maximum budget'
    });
  }
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize common string fields
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  };

  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    } else if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};