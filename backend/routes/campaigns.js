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

// Get influencer matches for business (for discovery)
router.get('/influencer-matches', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'business') {
      return res.status(403).json({ success: false, message: 'Only businesses can access this endpoint' });
    }

    // For now, return empty array since we don't have influencer matching logic yet
    console.log('🔍 Business requesting influencer matches...');
    
    res.json({
      success: true,
      influencers: [] // Empty for now until we implement matching logic
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

export default router;