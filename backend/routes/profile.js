import express from 'express';
import jwt from 'jsonwebtoken';
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

// Create/Update Influencer Profile
router.post('/influencer', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'influencer') {
      return res.status(403).json({ success: false, message: 'Only influencers can create influencer profiles' });
    }

    const {
      fullName,
      bio,
      profilePicture,
      primaryPlatform,
      primaryHandle,
      followerCount,
      contentNiche,
      secondaryPlatform,
      secondaryHandle,
      website,
      contentCategories,
      primaryAgeRange,
      genderSplit,
      primaryLocation,
      engagementRate,
      contentStyle,
      postingFrequency,
      instagramPrice,
      tiktokPrice,
      storyPrice,
      youtubePrice,
      communications,
      additionalNotes
    } = req.body;

    // Handle profilePicture - for now store null, later implement file upload
    const profilePictureUrl = (profilePicture && typeof profilePicture === 'string') ? profilePicture : null;

    // Check if profile already exists
    let profile = await InfluencerProfile.findOne({ userId: req.user._id });
    
    if (profile) {
      // Update existing profile
      profile = await InfluencerProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          fullName,
          bio,
          profilePicture: profilePictureUrl,
          socialLinks: {
            primaryPlatform,
            primaryHandle,
            followerCount: parseInt(followerCount) || 0,
            contentNiche,
            secondaryPlatform,
            secondaryHandle,
            website
          },
          contentInfo: {
            categories: contentCategories || [],
            primaryAgeRange,
            genderSplit,
            primaryLocation,
            engagementRate: parseFloat(engagementRate) || 0,
            contentStyle,
            postingFrequency
          },
          pricing: {
            instagramPrice: parseFloat(instagramPrice) || 0,
            tiktokPrice: parseFloat(tiktokPrice) || 0,
            storyPrice: parseFloat(storyPrice) || 0,
            youtubePrice: parseFloat(youtubePrice) || 0
          },
          communications: communications || [],
          additionalNotes
        },
        { new: true }
      );
    } else {
      // Create new profile
      profile = new InfluencerProfile({
        userId: req.user._id,
        fullName,
        bio,
        profilePicture: profilePictureUrl,
        socialLinks: {
          primaryPlatform,
          primaryHandle,
          followerCount: parseInt(followerCount) || 0,
          contentNiche,
          secondaryPlatform,
          secondaryHandle,
          website
        },
        contentInfo: {
          categories: contentCategories || [],
          primaryAgeRange,
          genderSplit,
          primaryLocation,
          engagementRate: parseFloat(engagementRate) || 0,
          contentStyle,
          postingFrequency
        },
        pricing: {
          instagramPrice: parseFloat(instagramPrice) || 0,
          tiktokPrice: parseFloat(tiktokPrice) || 0,
          storyPrice: parseFloat(storyPrice) || 0,
          youtubePrice: parseFloat(youtubePrice) || 0
        },
        communications: communications || [],
        additionalNotes
      });

      await profile.save();
    }

    console.log('✅ Influencer profile saved:', profile.fullName);

    res.json({
      success: true,
      message: 'Profile saved successfully',
      profile: {
        id: profile._id,
        fullName: profile.fullName,
        bio: profile.bio,
        socialLinks: profile.socialLinks,
        contentInfo: profile.contentInfo,
        pricing: profile.pricing
      }
    });

  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save profile', 
      error: error.message 
    });
  }
});

// Get Influencer Profile
router.get('/influencer', authenticate, async (req, res) => {
  try {
    const profile = await InfluencerProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get profile', 
      error: error.message 
    });
  }
});

export default router;