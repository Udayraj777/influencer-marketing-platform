import InfluencerProfile from '../models/InfluencerProfile.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { logger } from '../utils/logger.js';

// Intelligent matching algorithm for influencer-business pairing
class MatchingAlgorithm {
  constructor() {
    // Scoring weights for different factors
    this.weights = {
      niche: 0.3,          // 30% - Most important factor
      audience: 0.25,       // 25% - Audience alignment
      followerCount: 0.15,  // 15% - Follower count match
      engagement: 0.15,     // 15% - Engagement rate
      location: 0.1,        // 10% - Geographic alignment
      platform: 0.05       // 5% - Platform preference
    };
  }

  // Main matching function
  async findMatches(businessProfile, options = {}) {
    const {
      limit = 20,
      minScore = 0.3,
      includeUnavailable = false
    } = options;

    try {
      // Build base filter
      const baseFilter = {
        isActive: true,
        isProfileComplete: true
      };

      // Add availability filter if needed
      if (!includeUnavailable) {
        baseFilter['availability.status'] = 'available';
      }

      // Apply business matching criteria
      const matchingCriteria = businessProfile.preferences.matching.matchingCriteria;

      // Follower count filtering
      if (matchingCriteria.minFollowers) {
        baseFilter['stats.totalFollowers'] = { $gte: matchingCriteria.minFollowers };
      }
      if (matchingCriteria.maxFollowers) {
        baseFilter['stats.totalFollowers'] = { 
          ...baseFilter['stats.totalFollowers'], 
          $lte: matchingCriteria.maxFollowers 
        };
      }

      // Engagement rate filtering
      if (matchingCriteria.minEngagementRate) {
        baseFilter['stats.averageEngagementRate'] = { $gte: matchingCriteria.minEngagementRate };
      }

      // Verification filtering
      if (matchingCriteria.verifiedOnly) {
        baseFilter['verificationStatus.isVerified'] = true;
      }

      // Get all potential matches
      const influencers = await InfluencerProfile.find(baseFilter)
        .populate('userId', 'name email')
        .limit(limit * 2); // Get more to filter and score

      // Score and rank influencers
      const scoredInfluencers = influencers.map(influencer => {
        const score = this.calculateMatchScore(businessProfile, influencer);
        return {
          influencer,
          score,
          breakdown: this.getScoreBreakdown(businessProfile, influencer)
        };
      });

      // Filter by minimum score and sort
      const filteredMatches = scoredInfluencers
        .filter(match => match.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return filteredMatches;
    } catch (error) {
      logger.error('Matching algorithm error:', error);
      throw error;
    }
  }

  // Calculate overall match score
  calculateMatchScore(businessProfile, influencerProfile) {
    const nicheScore = this.calculateNicheScore(businessProfile, influencerProfile);
    const audienceScore = this.calculateAudienceScore(businessProfile, influencerProfile);
    const followerScore = this.calculateFollowerScore(businessProfile, influencerProfile);
    const engagementScore = this.calculateEngagementScore(businessProfile, influencerProfile);
    const locationScore = this.calculateLocationScore(businessProfile, influencerProfile);
    const platformScore = this.calculatePlatformScore(businessProfile, influencerProfile);

    const totalScore = (
      nicheScore * this.weights.niche +
      audienceScore * this.weights.audience +
      followerScore * this.weights.followerCount +
      engagementScore * this.weights.engagement +
      locationScore * this.weights.location +
      platformScore * this.weights.platform
    );

    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
  }

  // Calculate niche/interest alignment score
  calculateNicheScore(businessProfile, influencerProfile) {
    const businessInterests = businessProfile.targetAudience.demographics.interests || [];
    const influencerNiches = influencerProfile.niches || [];

    if (businessInterests.length === 0 || influencerNiches.length === 0) {
      return 0.5; // Neutral score if no data
    }

    // Calculate intersection
    const intersection = businessInterests.filter(interest => 
      influencerNiches.includes(interest)
    ).length;

    // Score based on overlap percentage
    const overlapScore = intersection / Math.max(businessInterests.length, influencerNiches.length);
    
    // Bonus for exact matches
    const exactMatchBonus = intersection > 0 ? 0.2 : 0;
    
    return Math.min(overlapScore + exactMatchBonus, 1.0);
  }

  // Calculate audience demographic alignment score
  calculateAudienceScore(businessProfile, influencerProfile) {
    const targetAudience = businessProfile.targetAudience;
    const influencerDemographics = influencerProfile.demographics;

    let score = 0;
    let factors = 0;

    // Age range alignment
    if (targetAudience.demographics.ageRanges && targetAudience.demographics.ageRanges.length > 0) {
      const ageScore = this.calculateAgeAlignment(
        targetAudience.demographics.ageRanges,
        influencerDemographics.ageDistribution
      );
      score += ageScore;
      factors++;
    }

    // Gender alignment
    if (targetAudience.demographics.genders && targetAudience.demographics.genders.length > 0) {
      const genderScore = this.calculateGenderAlignment(
        targetAudience.demographics.genders,
        influencerDemographics.genderSplit
      );
      score += genderScore;
      factors++;
    }

    // Geographic alignment
    if (targetAudience.geography.countries && targetAudience.geography.countries.length > 0) {
      const geoScore = this.calculateGeographicAlignment(
        targetAudience.geography.countries,
        influencerDemographics.topCountries
      );
      score += geoScore;
      factors++;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  // Calculate follower count alignment score
  calculateFollowerScore(businessProfile, influencerProfile) {
    const matchingCriteria = businessProfile.preferences.matching.matchingCriteria;
    const followerCount = influencerProfile.stats.totalFollowers;

    // If no criteria set, give neutral score
    if (!matchingCriteria.minFollowers && !matchingCriteria.maxFollowers) {
      return 0.5;
    }

    const minFollowers = matchingCriteria.minFollowers || 0;
    const maxFollowers = matchingCriteria.maxFollowers || 1000000;

    // Score based on how well follower count fits in desired range
    if (followerCount >= minFollowers && followerCount <= maxFollowers) {
      // Perfect fit - score based on position in range
      const rangePosition = (followerCount - minFollowers) / (maxFollowers - minFollowers);
      // Prefer middle of range
      return 1.0 - Math.abs(rangePosition - 0.5);
    } else if (followerCount < minFollowers) {
      // Below minimum - score decreases based on how far below
      const deficit = minFollowers - followerCount;
      return Math.max(0, 1.0 - (deficit / minFollowers));
    } else {
      // Above maximum - score decreases based on how far above
      const excess = followerCount - maxFollowers;
      return Math.max(0, 1.0 - (excess / maxFollowers));
    }
  }

  // Calculate engagement rate score
  calculateEngagementScore(businessProfile, influencerProfile) {
    const minEngagement = businessProfile.preferences.matching.matchingCriteria.minEngagementRate || 0;
    const influencerEngagement = influencerProfile.stats.averageEngagementRate || 0;

    if (influencerEngagement >= minEngagement) {
      // Bonus for higher engagement
      const bonus = Math.min((influencerEngagement - minEngagement) / 10, 0.3);
      return Math.min(0.7 + bonus, 1.0);
    } else {
      // Penalty for lower engagement
      const penalty = (minEngagement - influencerEngagement) / minEngagement;
      return Math.max(0, 0.7 - penalty);
    }
  }

  // Calculate location alignment score
  calculateLocationScore(businessProfile, influencerProfile) {
    const businessCountry = businessProfile.location.country;
    const influencerCountry = influencerProfile.location.country;

    // Same country gets highest score
    if (businessCountry === influencerCountry) {
      return 1.0;
    }

    // Check if business targets influencer's country
    const targetCountries = businessProfile.targetAudience.geography.countries || [];
    if (targetCountries.includes(influencerCountry)) {
      return 0.8;
    }

    // Check if influencer's audience is in business's country
    const influencerAudienceCountries = influencerProfile.demographics.topCountries || [];
    const businessCountryInAudience = influencerAudienceCountries.find(
      country => country.country === businessCountry
    );
    
    if (businessCountryInAudience) {
      return 0.6 + (businessCountryInAudience.percentage / 100) * 0.3;
    }

    // Default score for different countries
    return 0.3;
  }

  // Calculate platform preference score
  calculatePlatformScore(businessProfile, influencerProfile) {
    const businessPlatforms = businessProfile.targetAudience.platforms || [];
    const influencerPlatforms = influencerProfile.socialLinks.map(link => link.platform);

    if (businessPlatforms.length === 0) {
      return 0.5; // Neutral if no preference
    }

    // Calculate platform overlap
    const commonPlatforms = businessPlatforms.filter(platform => 
      influencerPlatforms.includes(platform)
    );

    const overlapScore = commonPlatforms.length / businessPlatforms.length;

    // Bonus for primary platform match
    const primaryPlatform = influencerProfile.primarySocialPlatform?.platform;
    const primaryBonus = businessPlatforms.includes(primaryPlatform) ? 0.2 : 0;

    return Math.min(overlapScore + primaryBonus, 1.0);
  }

  // Helper function to calculate age alignment
  calculateAgeAlignment(targetAgeRanges, influencerAgeDistribution) {
    if (!influencerAgeDistribution || influencerAgeDistribution.length === 0) {
      return 0.5;
    }

    let totalOverlap = 0;
    
    for (const targetRange of targetAgeRanges) {
      const matchingDistribution = influencerAgeDistribution.find(
        dist => dist.ageRange === targetRange
      );
      
      if (matchingDistribution) {
        totalOverlap += matchingDistribution.percentage;
      }
    }

    return Math.min(totalOverlap / 100, 1.0);
  }

  // Helper function to calculate gender alignment
  calculateGenderAlignment(targetGenders, influencerGenderSplit) {
    if (!influencerGenderSplit) {
      return 0.5;
    }

    let totalAlignment = 0;
    
    for (const targetGender of targetGenders) {
      const genderPercentage = influencerGenderSplit[targetGender] || 0;
      totalAlignment += genderPercentage;
    }

    return Math.min(totalAlignment / 100, 1.0);
  }

  // Helper function to calculate geographic alignment
  calculateGeographicAlignment(targetCountries, influencerTopCountries) {
    if (!influencerTopCountries || influencerTopCountries.length === 0) {
      return 0.5;
    }

    let totalAlignment = 0;
    
    for (const targetCountry of targetCountries) {
      const countryData = influencerTopCountries.find(
        country => country.country === targetCountry
      );
      
      if (countryData) {
        totalAlignment += countryData.percentage;
      }
    }

    return Math.min(totalAlignment / 100, 1.0);
  }

  // Get detailed score breakdown for debugging/transparency
  getScoreBreakdown(businessProfile, influencerProfile) {
    return {
      niche: this.calculateNicheScore(businessProfile, influencerProfile),
      audience: this.calculateAudienceScore(businessProfile, influencerProfile),
      followerCount: this.calculateFollowerScore(businessProfile, influencerProfile),
      engagement: this.calculateEngagementScore(businessProfile, influencerProfile),
      location: this.calculateLocationScore(businessProfile, influencerProfile),
      platform: this.calculatePlatformScore(businessProfile, influencerProfile)
    };
  }
}

// Initialize matching algorithm
const matchingAlgorithm = new MatchingAlgorithm();

// Find matches for a business
export const findInfluencerMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      limit = 20,
      minScore = 0.3,
      includeUnavailable = false
    } = req.query;

    // Check if user is a business
    if (req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can access matching functionality'
      });
    }

    // Get business profile
    const businessProfile = await BusinessProfile.findOne({ userId });
    if (!businessProfile) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    // Check if profile is complete enough for matching
    if (!businessProfile.isProfileComplete) {
      return res.status(400).json({
        success: false,
        message: 'Complete your business profile to access matching'
      });
    }

    // Find matches
    const matches = await matchingAlgorithm.findMatches(businessProfile, {
      limit: parseInt(limit),
      minScore: parseFloat(minScore),
      includeUnavailable: includeUnavailable === 'true'
    });

    logger.info(`Found ${matches.length} matches for business: ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: {
        matches: matches.map(match => ({
          influencer: match.influencer.toJSON(),
          matchScore: match.score,
          scoreBreakdown: match.breakdown
        })),
        totalMatches: matches.length,
        criteria: {
          minScore: parseFloat(minScore),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Find influencer matches error:', error);
    next(error);
  }
};

// Find matches for an influencer (reverse matching)
export const findBusinessMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      limit = 20,
      minScore = 0.3
    } = req.query;

    // Check if user is an influencer
    if (req.user.role !== 'influencer') {
      return res.status(403).json({
        success: false,
        message: 'Only influencers can access business matching functionality'
      });
    }

    // Get influencer profile
    const influencerProfile = await InfluencerProfile.findOne({ userId });
    if (!influencerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    // Check if profile is complete enough for matching
    if (!influencerProfile.isProfileComplete) {
      return res.status(400).json({
        success: false,
        message: 'Complete your influencer profile to access matching'
      });
    }

    // Get active businesses
    const businesses = await BusinessProfile.find({
      isActive: true,
      isProfileComplete: true,
      'preferences.matching.autoMatchEnabled': true
    }).populate('userId', 'name email');

    // Score businesses for this influencer
    const scoredBusinesses = businesses.map(business => {
      const score = matchingAlgorithm.calculateMatchScore(business, influencerProfile);
      return {
        business,
        score,
        breakdown: matchingAlgorithm.getScoreBreakdown(business, influencerProfile)
      };
    });

    // Filter by minimum score and sort
    const filteredMatches = scoredBusinesses
      .filter(match => match.score >= parseFloat(minScore))
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit));

    logger.info(`Found ${filteredMatches.length} business matches for influencer: ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: {
        matches: filteredMatches.map(match => ({
          business: match.business.toJSON(),
          matchScore: match.score,
          scoreBreakdown: match.breakdown
        })),
        totalMatches: filteredMatches.length,
        criteria: {
          minScore: parseFloat(minScore),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Find business matches error:', error);
    next(error);
  }
};

// Get matching statistics
export const getMatchingStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'business') {
      const businessProfile = await BusinessProfile.findOne({ userId });
      if (!businessProfile) {
        return res.status(404).json({
          success: false,
          message: 'Business profile not found'
        });
      }

      // Get total available influencers
      const totalInfluencers = await InfluencerProfile.countDocuments({
        isActive: true,
        isProfileComplete: true,
        'availability.status': 'available'
      });

      // Get matches count
      const matches = await matchingAlgorithm.findMatches(businessProfile, {
        limit: 1000,
        minScore: 0.3
      });

      stats = {
        totalAvailableInfluencers: totalInfluencers,
        potentialMatches: matches.length,
        matchingCriteria: businessProfile.preferences.matching.matchingCriteria,
        autoMatchEnabled: businessProfile.preferences.matching.autoMatchEnabled
      };
    } else if (userRole === 'influencer') {
      const influencerProfile = await InfluencerProfile.findOne({ userId });
      if (!influencerProfile) {
        return res.status(404).json({
          success: false,
          message: 'Influencer profile not found'
        });
      }

      // Get total active businesses
      const totalBusinesses = await BusinessProfile.countDocuments({
        isActive: true,
        isProfileComplete: true,
        'preferences.matching.autoMatchEnabled': true
      });

      stats = {
        totalActiveBusinesses: totalBusinesses,
        availability: influencerProfile.availability.status,
        profileCompleteness: influencerProfile.isProfileComplete,
        verificationStatus: influencerProfile.verificationStatus.isVerified
      };
    }

    res.status(200).json({
      success: true,
      data: {
        stats,
        userRole
      }
    });
  } catch (error) {
    logger.error('Get matching stats error:', error);
    next(error);
  }
};