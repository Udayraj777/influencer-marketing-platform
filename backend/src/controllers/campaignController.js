import { validationResult } from 'express-validator';
import Campaign from '../models/Campaign.js';
import BusinessProfile from '../models/BusinessProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import { logger } from '../utils/logger.js';

// Create a new campaign
export const createCampaign = async (req, res, next) => {
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
        message: 'Only businesses can create campaigns'
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

    // Check if business can create more campaigns
    if (!businessProfile.canCreateCampaign()) {
      return res.status(403).json({
        success: false,
        message: 'Campaign limit reached for your subscription plan'
      });
    }

    // Create new campaign
    const campaign = new Campaign({
      businessId: businessProfile._id,
      businessUserId: userId,
      ...req.body
    });

    await campaign.save();

    // Update business stats
    businessProfile.stats.campaignsPosted += 1;
    await businessProfile.save();

    logger.info(`Campaign created by business: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: {
        campaign: campaign.toJSON()
      }
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    next(error);
  }
};

// Get all campaigns with filtering
export const getCampaigns = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      budget,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (budget) {
      const budgetRange = budget.split('-');
      if (budgetRange.length === 2) {
        filter['budget.amount'] = {
          $gte: parseInt(budgetRange[0]),
          $lte: parseInt(budgetRange[1])
        };
      }
    }

    if (location) {
      filter['targetLocation.countries'] = { $in: [location] };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Execute query
    const [campaigns, totalCount] = await Promise.all([
      Campaign.find(filter)
        .populate('businessId', 'companyName logo industry')
        .sort(sort)
        .skip(skip)
        .limit(pageSize),
      Campaign.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        campaigns: campaigns.map(c => c.toJSON()),
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    next(error);
  }
};

// Get campaign by ID
export const getCampaignById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id)
      .populate('businessId', 'companyName logo industry contactInfo')
      .populate('applicants.influencerId', 'userId bio profilePicture stats');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        campaign: campaign.toJSON()
      }
    });
  } catch (error) {
    logger.error('Get campaign by ID error:', error);
    next(error);
  }
};

// Update campaign
export const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if user is a business
    if (req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can update campaigns'
      });
    }

    // Find campaign and check ownership
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.businessUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own campaigns'
      });
    }

    // Check if campaign can be updated
    if (['completed', 'cancelled'].includes(campaign.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled campaigns'
      });
    }

    // Update campaign
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    logger.info(`Campaign updated by business: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: {
        campaign: updatedCampaign.toJSON()
      }
    });
  } catch (error) {
    logger.error('Update campaign error:', error);
    next(error);
  }
};

// Delete campaign
export const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if user is a business
    if (req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can delete campaigns'
      });
    }

    // Find campaign and check ownership
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.businessUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own campaigns'
      });
    }

    // Check if campaign can be deleted
    if (campaign.status === 'active' && campaign.applicants.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete active campaigns with applicants'
      });
    }

    // Soft delete campaign
    await Campaign.findByIdAndUpdate(id, { isActive: false });

    logger.info(`Campaign deleted by business: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Delete campaign error:', error);
    next(error);
  }
};

// Apply to campaign (for influencers)
export const applyToCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if user is an influencer
    if (req.user.role !== 'influencer') {
      return res.status(403).json({
        success: false,
        message: 'Only influencers can apply to campaigns'
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

    // Find campaign
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if campaign is active
    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not active'
      });
    }

    // Check if already applied
    const existingApplication = campaign.applicants.find(
      app => app.influencerId.toString() === influencerProfile._id.toString()
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this campaign'
      });
    }

    // Add application
    campaign.applicants.push({
      influencerId: influencerProfile._id,
      appliedAt: new Date(),
      status: 'pending',
      proposalMessage: req.body.proposalMessage || '',
      proposedRate: req.body.proposedRate || 0
    });

    await campaign.save();

    logger.info(`Influencer applied to campaign: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    logger.error('Apply to campaign error:', error);
    next(error);
  }
};

// Get business campaigns
export const getBusinessCampaigns = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Check if user is a business
    if (req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only businesses can access this endpoint'
      });
    }

    // Build filter
    const filter = { businessUserId: userId, isActive: true };
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Execute query
    const [campaigns, totalCount] = await Promise.all([
      Campaign.find(filter)
        .populate('applicants.influencerId', 'userId bio profilePicture stats')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Campaign.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        campaigns: campaigns.map(c => c.toJSON()),
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Get business campaigns error:', error);
    next(error);
  }
};

// Get influencer applications
export const getInfluencerApplications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Check if user is an influencer
    if (req.user.role !== 'influencer') {
      return res.status(403).json({
        success: false,
        message: 'Only influencers can access this endpoint'
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

    // Build filter
    const filter = {
      'applicants.influencerId': influencerProfile._id,
      isActive: true
    };

    if (status) {
      filter['applicants.status'] = status;
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Execute query
    const campaigns = await Campaign.find(filter)
      .populate('businessId', 'companyName logo industry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await Campaign.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        applications: campaigns.map(campaign => ({
          campaign: campaign.toJSON(),
          application: campaign.applicants.find(
            app => app.influencerId.toString() === influencerProfile._id.toString()
          )
        })),
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Get influencer applications error:', error);
    next(error);
  }
};