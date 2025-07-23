import express from 'express';
import jwt from 'jsonwebtoken';
import BusinessProfile from '../models/BusinessProfile.js';
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

// Create/Update Business Profile
router.post('/business', authenticate, async (req, res) => {
  try {
    console.log('🔒 Business profile creation - User authenticated:', req.user.email, 'Role:', req.user.role);
    
    if (req.user.role !== 'business') {
      console.log('❌ Role check failed - user role:', req.user.role);
      return res.status(403).json({ success: false, message: 'Only businesses can create business profiles' });
    }
    
    console.log('✅ Role check passed - proceeding with profile creation');

    const {
      companyName,
      companyDescription,
      companyLogo,
      industry,
      companySize,
      website,
      contactInfo,
      targetAudience,
      campaignPreferences,
      additionalNotes
    } = req.body;

    console.log('📥 Received business profile data:', {
      companyName,
      industry,
      companySize,
      website,
      targetAudience,
      campaignPreferences
    });

    // Check if profile already exists
    let profile = await BusinessProfile.findOne({ userId: req.user._id });
    
    if (profile) {
      // Update existing profile
      profile = await BusinessProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          companyName,
          companyDescription: companyDescription || 'Business profile created through onboarding',
          industry,
          companySize,
          website: website || '',
          headquarters: 'Not specified',
          campaignPreferences: {
            typicalBudget: campaignPreferences?.budget,
            preferredPlatforms: campaignPreferences?.platforms || [],
            targetAudience: JSON.stringify(targetAudience || {}),
            campaignTypes: [],
            collaborationStyle: campaignPreferences?.contentRequirements || ''
          }
        },
        { new: true }
      );
    } else {
      // Create new profile
      profile = new BusinessProfile({
        userId: req.user._id,
        companyName,
        companyDescription: companyDescription || 'Business profile created through onboarding',
        industry,
        companySize,
        website: website || '',
        headquarters: 'Not specified',
        campaignPreferences: {
          typicalBudget: campaignPreferences?.budget,
          preferredPlatforms: campaignPreferences?.platforms || [],
          targetAudience: JSON.stringify(targetAudience || {}),
          campaignTypes: [],
          collaborationStyle: campaignPreferences?.contentRequirements || ''
        }
      });

      await profile.save();
    }

    console.log('✅ Business profile saved successfully:', profile.companyName, 'for user:', req.user.email);

    res.json({
      success: true,
      message: 'Business profile saved successfully',
      profile: {
        id: profile._id,
        companyName: profile.companyName,
        companyDescription: profile.companyDescription,
        industry: profile.industry,
        companySize: profile.companySize,
        website: profile.website,
        headquarters: profile.headquarters,
        contactInfo: profile.contactInfo,
        campaignPreferences: profile.campaignPreferences,
        stats: profile.stats
      }
    });

  } catch (error) {
    console.error('Business profile creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save business profile', 
      error: error.message 
    });
  }
});

// Get Business Profile
router.get('/business', authenticate, async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Get business profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get business profile', 
      error: error.message 
    });
  }
});

export default router;