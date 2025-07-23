import express from 'express';
import jwt from 'jsonwebtoken';
import Campaign from '../models/Campaign.js';
import BusinessProfile from '../models/BusinessProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify JWT and get user
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Create new campaign (Business only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ success: false, message: 'Only businesses can create campaigns' });
    }

    // Get business profile
    const businessProfile = await BusinessProfile.findOne({ userId: req.user._id });
    if (!businessProfile) {
      return res.status(404).json({ success: false, message: 'Business profile not found. Please complete your profile first.' });
    }

    const {
      title,
      description,
      budget: budgetRange,
      platform,
      categories,
      deliverables,
      timeline,
      companyName,
      companyIndustry
    } = req.body;
    
    console.log('📥 Received campaign data:', {
      title,
      description,
      budgetRange,
      platform,
      categories,
      deliverables,
      timeline
    });
    
    // Map frontend data to backend schema
    const budgetAmount = budgetRange === '500-1000' ? 750 : 
                        budgetRange === '1000-2500' ? 1750 : 
                        budgetRange === '2500-5000' ? 3750 : 
                        budgetRange === '5000-10000' ? 7500 : 
                        budgetRange === '10000+' ? 15000 : 1000;
    
    // Map frontend categories to backend enum values
    const categoryMapping = {
      'Fashion': 'Fashion & Beauty',
      'Beauty': 'Fashion & Beauty', 
      'Lifestyle': 'Lifestyle',
      'Fitness': 'Fitness & Health',
      'Food': 'Food & Beverage',
      'Tech': 'Technology',
      'Travel': 'Travel',
      'Gaming': 'Gaming'
    };
    
    const mappedCategory = categoryMapping[categories?.[0]] || 'Other';

    // Create new campaign
    const campaign = new Campaign({
      businessId: req.user._id,
      businessProfileId: businessProfile._id,
      title,
      description,
      campaignType: 'sponsored-post', // Valid enum value
      category: mappedCategory, // Use mapped category
      platforms: [platform.toLowerCase()], // Convert to lowercase for enum
      requirements: {
        minFollowers: 1000,
        minEngagement: 2.0,
        targetAudience: {
          ageRange: ['18-35'],
          interests: categories || []
        }
      },
      budget: {
        total: budgetAmount,
        perInfluencer: Math.floor(budgetAmount / 5) // Assume 5 influencers
      },
      timeline: {
        campaignStart: timeline?.startDate ? new Date(timeline.startDate) : new Date(),
        campaignEnd: timeline?.endDate ? new Date(timeline.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        applicationDeadline: timeline?.startDate ? new Date(new Date(timeline.startDate).getTime() - 7 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days before start or 7 days from now
        contentDeadline: timeline?.endDate ? new Date(timeline.endDate) : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
      },
      contentGuidelines: {
        style: 'authentic',
        mustInclude: deliverables || [],
        restrictions: []
      },
      deliverables: deliverables || [],
      maxInfluencers: 5,
      status: 'active' // Automatically activate campaign
    });

    await campaign.save();

    // Update business profile stats
    await BusinessProfile.findByIdAndUpdate(businessProfile._id, {
      $inc: { 'stats.totalCampaigns': 1, 'stats.activeCampaigns': 1 },
      $push: { campaigns: { campaignId: campaign._id, status: 'active' } }
    });

    console.log('✅ Campaign created:', campaign.title);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign: {
        id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        budget: campaign.budget,
        timeline: campaign.timeline,
        status: campaign.status
      }
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create campaign', 
      error: error.message 
    });
  }
});

// Get all active campaigns (for influencers to browse)
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, platform, minBudget, maxBudget } = req.query;
    
    let filter = { status: 'active' };
    
    // Add filters
    if (category) filter.category = category;
    if (platform) filter.platforms = { $in: [platform] };
    if (minBudget || maxBudget) {
      filter['budget.perInfluencer'] = {};
      if (minBudget) filter['budget.perInfluencer'].$gte = parseInt(minBudget);
      if (maxBudget) filter['budget.perInfluencer'].$lte = parseInt(maxBudget);
    }

    const campaigns = await Campaign.find(filter)
      .populate('businessId', 'name email')
      .populate('businessProfileId', 'companyName industry isVerified')
      .sort({ createdAt: -1 })
      .limit(50);

    // Format campaigns for frontend
    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign._id,
      title: campaign.title,
      description: campaign.description,
      company: campaign.businessProfileId.companyName,
      verified: campaign.businessProfileId.isVerified,
      budget: campaign.budget.perInfluencer,
      platform: campaign.platforms[0], // Primary platform
      deadline: calculateTimeLeft(campaign.timeline.applicationDeadline),
      applicants: campaign.applicationsCount,
      tags: campaign.contentGuidelines.hashtags || [],
      category: campaign.category,
      badge: getBadge(campaign)
    }));

    res.json({
      success: true,
      campaigns: formattedCampaigns
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get campaigns', 
      error: error.message 
    });
  }
});

// Get business's own campaigns
router.get('/my-campaigns', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ success: false, message: 'Only businesses can view their campaigns' });
    }

    const campaigns = await Campaign.find({ businessId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      campaigns
    });

  } catch (error) {
    console.error('Get my campaigns error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get campaigns', 
      error: error.message 
    });
  }
});

// Send direct invitation to influencer
router.post('/:campaignId/invite', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ success: false, message: 'Only businesses can send invitations' });
    }

    const { campaignId } = req.params;
    const { influencerId, message, proposedRate } = req.body;

    // Get campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.businessId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Get influencer
    const influencer = await InfluencerProfile.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer not found' });
    }

    // Check if already invited
    const existingInvite = campaign.invitations.find(
      inv => inv.influencerId.toString() === influencerId
    );
    if (existingInvite) {
      return res.status(400).json({ success: false, message: 'Influencer already invited to this campaign' });
    }

    // Add invitation to campaign
    campaign.invitations.push({
      influencerId,
      userId: influencer.userId,
      message,
      proposedRate
    });

    await campaign.save();

    // Add invitation to influencer's profile
    await InfluencerProfile.findByIdAndUpdate(influencerId, {
      $push: {
        directInvitations: {
          businessId: req.user._id,
          campaignId: campaign._id,
          status: 'pending'
        }
      }
    });

    console.log('✅ Invitation sent to influencer:', influencer.fullName);

    res.json({
      success: true,
      message: 'Invitation sent successfully'
    });

  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send invitation', 
      error: error.message 
    });
  }
});

// Apply to campaign (Influencer)
router.post('/:campaignId/apply', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'influencer') {
      return res.status(403).json({ success: false, message: 'Only influencers can apply to campaigns' });
    }

    const { campaignId } = req.params;
    const { proposedRate, message, portfolioLinks } = req.body;

    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Check if campaign is still active
    if (campaign.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Campaign is no longer active' });
    }

    // Find influencer profile
    const influencerProfile = await InfluencerProfile.findOne({ userId: req.user._id });
    if (!influencerProfile) {
      return res.status(404).json({ success: false, message: 'Influencer profile not found' });
    }

    // Check if already applied
    const existingApplication = campaign.applications.find(
      app => app.influencerId.toString() === influencerProfile._id.toString()
    );
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied to this campaign' });
    }

    // Add application to campaign
    campaign.applications.push({
      influencerId: influencerProfile._id,
      userId: req.user._id,
      proposedRate: parseFloat(proposedRate) || 0,
      message: message || '',
      portfolioLinks: portfolioLinks || [],
      status: 'pending'
    });

    // Update application count
    campaign.applicationsCount = campaign.applications.length;

    await campaign.save();

    console.log('✅ Application submitted:', {
      campaign: campaign.title,
      influencer: influencerProfile.fullName,
      proposedRate
    });

    res.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        campaignId: campaign._id,
        campaignTitle: campaign.title,
        status: 'pending',
        appliedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Apply to campaign error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit application', 
      error: error.message 
    });
  }
});

// Get influencer's applied campaigns
router.get('/my-applications', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'influencer') {
      return res.status(403).json({ success: false, message: 'Only influencers can view applications' });
    }

    // Find influencer profile
    const influencerProfile = await InfluencerProfile.findOne({ userId: req.user._id });
    if (!influencerProfile) {
      return res.status(404).json({ success: false, message: 'Influencer profile not found' });
    }

    // Find campaigns where this influencer has applied
    const campaigns = await Campaign.find({
      'applications.influencerId': influencerProfile._id
    }).populate('businessId', 'name email')
      .populate('businessProfileId', 'companyName industry')
      .sort({ 'applications.appliedAt': -1 });

    // Format the response with application details
    const appliedCampaigns = campaigns.map(campaign => {
      const application = campaign.applications.find(
        app => app.influencerId.toString() === influencerProfile._id.toString()
      );

      return {
        _id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        platforms: campaign.platforms,
        budget: campaign.budget,
        timeline: campaign.timeline,
        status: campaign.status,
        business: {
          name: campaign.businessProfileId?.companyName || campaign.businessId?.name,
          industry: campaign.businessProfileId?.industry
        },
        application: {
          status: application.status,
          proposedRate: application.proposedRate,
          message: application.message,
          appliedAt: application.appliedAt,
          reviewedAt: application.reviewedAt,
          businessNotes: application.businessNotes
        }
      };
    });

    res.json({
      success: true,
      applications: appliedCampaigns,
      total: appliedCampaigns.length
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications', 
      error: error.message 
    });
  }
});

// Get applications for a specific campaign (Business only)
router.get('/:campaignId/applications', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ success: false, message: 'Only businesses can view campaign applications' });
    }

    const { campaignId } = req.params;
    
    // Find the campaign and verify ownership
    const campaign = await Campaign.findOne({ 
      _id: campaignId, 
      businessId: req.user._id 
    }).populate({
      path: 'applications.influencerId',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found or not authorized' });
    }

    // Format applications with influencer details
    const formattedApplications = campaign.applications.map(application => ({
      _id: application._id,
      influencer: {
        id: application.influencerId._id,
        name: application.influencerId.fullName || application.influencerId.userId?.name || 'Unknown',
        bio: application.influencerId.bio || 'No bio available',
        platform: application.influencerId.socialLinks?.primaryPlatform || 'unknown',
        followers: application.influencerId.socialLinks?.followerCount || 0,
        niche: application.influencerId.socialLinks?.contentNiche || 'general',
        engagement: application.influencerId.contentInfo?.engagementRate || 0,
        location: application.influencerId.contentInfo?.primaryLocation || 'Unknown',
        avatar: (application.influencerId.fullName || application.influencerId.userId?.name || 'U').charAt(0).toUpperCase(),
        profilePicture: application.influencerId.profilePicture,
        pricing: application.influencerId.pricing || {},
        socialLinks: application.influencerId.socialLinks
      },
      application: {
        proposedRate: application.proposedRate,
        message: application.message,
        portfolioLinks: application.portfolioLinks,
        status: application.status,
        appliedAt: application.appliedAt,
        reviewedAt: application.reviewedAt,
        businessNotes: application.businessNotes
      }
    }));

    res.json({
      success: true,
      campaign: {
        _id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        applicationsCount: campaign.applicationsCount
      },
      applications: formattedApplications,
      total: formattedApplications.length
    });

  } catch (error) {
    console.error('Get campaign applications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications', 
      error: error.message 
    });
  }
});

// Helper functions
function calculateTimeLeft(deadline) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'Expired';
  if (diffDays === 1) return '1 day';
  if (diffDays <= 7) return `${diffDays} days`;
  if (diffDays <= 14) return '2 weeks';
  if (diffDays <= 21) return '3 weeks';
  return `${Math.ceil(diffDays / 7)} weeks`;
}

function getBadge(campaign) {
  const now = new Date();
  const deadline = new Date(campaign.timeline.applicationDeadline);
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  if (campaign.isFeatured) return { type: 'featured', label: 'Featured' };
  if (campaign.isUrgent || daysLeft <= 3) return { type: 'urgent', label: 'Urgent' };
  if (daysLeft <= 7) return { type: 'new', label: 'New' };
  return { type: 'normal', label: '' };
}

function calculateMatchScore(influencer) {
  let score = 60; // Base score
  
  // Boost score based on follower count
  if (influencer.socialLinks.followerCount > 100000) score += 20;
  else if (influencer.socialLinks.followerCount > 50000) score += 15;
  else if (influencer.socialLinks.followerCount > 10000) score += 10;
  else if (influencer.socialLinks.followerCount > 1000) score += 5;
  
  // Boost score based on engagement rate
  if (influencer.contentInfo.engagementRate > 5) score += 15;
  else if (influencer.contentInfo.engagementRate > 3) score += 10;
  else if (influencer.contentInfo.engagementRate > 1) score += 5;
  
  // Boost score based on completed campaigns
  if (influencer.stats?.completedCampaigns > 10) score += 10;
  else if (influencer.stats?.completedCampaigns > 5) score += 5;
  
  // Boost score based on average rating
  if (influencer.stats?.averageRating >= 4.5) score += 10;
  else if (influencer.stats?.averageRating >= 4) score += 5;
  
  return Math.min(score, 99); // Cap at 99%
}

function formatFollowerCount(count) {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Get influencer matches for business (for discovery)
router.get('/influencer-matches', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ success: false, message: 'Only businesses can access this endpoint' });
    }

    console.log('🔍 Business requesting influencer matches...');
    
    // Get query parameters for filtering
    const { 
      category, 
      platform, 
      minFollowers, 
      maxFollowers, 
      location,
      limit = 20 
    } = req.query;

    // Build filter object
    let filter = { isActive: true };
    
    if (category) {
      filter['socialLinks.contentNiche'] = category.toLowerCase();
    }
    
    if (platform) {
      filter['socialLinks.primaryPlatform'] = platform.toLowerCase();
    }
    
    if (minFollowers || maxFollowers) {
      filter['socialLinks.followerCount'] = {};
      if (minFollowers) filter['socialLinks.followerCount'].$gte = parseInt(minFollowers);
      if (maxFollowers) filter['socialLinks.followerCount'].$lte = parseInt(maxFollowers);
    }
    
    if (location) {
      filter['contentInfo.primaryLocation'] = { $regex: location, $options: 'i' };
    }

    // Fetch influencers from database
    console.log('🔍 Filter being used:', filter);
    const influencers = await InfluencerProfile.find(filter)
      .populate('userId', 'name email')
      .limit(parseInt(limit))
      .sort({ 'socialLinks.followerCount': -1 });
    
    console.log(`📊 Found ${influencers.length} influencers in database`);
    if (influencers.length > 0) {
      console.log('🎯 Sample influencer data:', {
        name: influencers[0].userId?.name,
        niches: influencers[0].niches,
        socialLinks: influencers[0].socialLinks,
        stats: influencers[0].stats
      });
    }

    // Format influencers for frontend
    const formattedInfluencers = influencers.map(influencer => {
      // Calculate match score based on various factors
      const matchScore = calculateMatchScore(influencer);
      
      return {
        id: influencer._id,
        name: influencer.fullName || influencer.userId?.name || 'Unknown',
        username: influencer.socialLinks?.primaryHandle ? `@${influencer.socialLinks.primaryHandle.replace(/^https?:\/\/[^\/]+\//, '').replace('@', '')}` : '@unknown',
        platform: influencer.socialLinks?.primaryPlatform || 'unknown',
        followers: formatFollowerCount(influencer.socialLinks?.followerCount || 0),
        engagement: `${influencer.contentInfo?.engagementRate || 0}%`,
        niche: influencer.socialLinks?.contentNiche || 'general',
        niches: [influencer.socialLinks?.contentNiche || 'general'], // Convert single niche to array for consistency
        location: influencer.contentInfo?.primaryLocation || 'Not specified',
        avatar: (influencer.fullName || influencer.userId?.name || 'U').charAt(0).toUpperCase(),
        verified: influencer.socialLinks?.followerCount > 10000 || false, // Simple verification based on followers
        matchScore: matchScore,
        bio: influencer.bio || 'No bio available',
        website: influencer.socialLinks?.website,
        profilePicture: influencer.profilePicture,
        pricing: {
          instagram: influencer.pricing?.instagramPrice || 0,
          tiktok: influencer.pricing?.tiktokPrice || 0,
          story: influencer.pricing?.storyPrice || 0,
          youtube: influencer.pricing?.youtubePrice || 0
        },
        socialLinks: influencer.socialLinks ? [{
          platform: influencer.socialLinks.primaryPlatform,
          username: influencer.socialLinks.primaryHandle,
          url: influencer.socialLinks.primaryHandle
        }] : [],
        stats: {
          totalCampaigns: 0, // These would need to be calculated from actual campaign data
          completedCampaigns: 0,
          averageRating: 5.0,
          totalEarnings: 0
        }
      };
    });
    
    res.json({
      success: true,
      influencers: formattedInfluencers,
      total: formattedInfluencers.length
    });

  } catch (error) {
    console.error('Error fetching influencer matches:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch influencer matches', 
      error: error.message 
    });
  }
});

// Get individual influencer profile for viewing
router.get('/influencer-profile/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ success: false, message: 'Only businesses can access this endpoint' });
    }

    const { id } = req.params;
    
    const influencer = await InfluencerProfile.findById(id)
      .populate('userId', 'name email');
    
    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer not found' });
    }

    // Format detailed influencer profile
    const profileData = {
      id: influencer._id,
      name: influencer.fullName,
      bio: influencer.bio,
      profilePicture: influencer.profilePicture,
      socialLinks: {
        primaryPlatform: influencer.socialLinks.primaryPlatform,
        primaryHandle: influencer.socialLinks.primaryHandle,
        followerCount: influencer.socialLinks.followerCount,
        contentNiche: influencer.socialLinks.contentNiche,
        secondaryPlatform: influencer.socialLinks.secondaryPlatform,
        secondaryHandle: influencer.socialLinks.secondaryHandle,
        website: influencer.socialLinks.website
      },
      contentInfo: influencer.contentInfo,
      pricing: influencer.pricing,
      stats: {
        totalCampaigns: influencer.stats?.totalCampaigns || 0,
        completedCampaigns: influencer.stats?.completedCampaigns || 0,
        averageRating: influencer.stats?.averageRating || 0,
        totalEarnings: influencer.stats?.totalEarnings || 0
      },
      communications: influencer.communications,
      additionalNotes: influencer.additionalNotes,
      isActive: influencer.isActive,
      createdAt: influencer.createdAt
    };

    res.json({
      success: true,
      profile: profileData
    });

  } catch (error) {
    console.error('Error fetching influencer profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch influencer profile', 
      error: error.message 
    });
  }
});

// Get direct invitations for influencer
router.get('/my-invitations', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'influencer') {
      return res.status(403).json({ success: false, message: 'Only influencers can view invitations' });
    }

    // Find influencer profile
    const influencerProfile = await InfluencerProfile.findOne({ userId: req.user._id })
      .populate({
        path: 'directInvitations.businessId',
        select: 'name email'
      })
      .populate({
        path: 'directInvitations.campaignId',
        populate: {
          path: 'businessProfileId',
          select: 'companyName industry'
        }
      });
    
    if (!influencerProfile) {
      return res.status(404).json({ success: false, message: 'Influencer profile not found' });
    }

    // Format invitations for frontend
    const formattedInvitations = influencerProfile.directInvitations
      .filter(invite => invite.status === 'pending') // Only show pending invitations
      .map(invite => ({
        id: invite._id,
        title: invite.campaignId?.title || 'Campaign Invitation',
        company: invite.campaignId?.businessProfileId?.companyName || invite.businessId?.name || 'Unknown Company',
        campaign: invite.campaignId?.title || 'Unknown Campaign',
        budget: invite.campaignId?.budget?.perInfluencer || 0,
        receivedDate: invite.invitedAt ? new Date(invite.invitedAt).toLocaleDateString() : 'Unknown',
        message: `You have been invited to participate in ${invite.campaignId?.title || 'this campaign'}.`,
        status: invite.status,
        campaignId: invite.campaignId?._id,
        businessId: invite.businessId?._id
      }));

    res.json({
      success: true,
      invitations: formattedInvitations,
      total: formattedInvitations.length
    });

  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch invitations', 
      error: error.message 
    });
  }
});

export default router;