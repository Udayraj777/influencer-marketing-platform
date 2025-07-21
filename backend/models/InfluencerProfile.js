import mongoose from 'mongoose';

const influencerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Info (Step 1)
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true,
    maxlength: 500
  },
  profilePicture: {
    type: String, // URL to image
    default: null
  },
  
  // Social Media (Step 2)
  socialLinks: {
    primaryPlatform: {
      type: String,
      required: true,
      enum: ['instagram', 'tiktok', 'youtube', 'twitter']
    },
    primaryHandle: {
      type: String,
      required: true
    },
    followerCount: {
      type: Number,
      required: true
    },
    contentNiche: {
      type: String,
      required: true
    },
    secondaryPlatform: String,
    secondaryHandle: String,
    website: String
  },
  
  // Content & Audience (Step 3)
  contentInfo: {
    categories: [String],
    primaryAgeRange: String,
    genderSplit: String,
    primaryLocation: String,
    engagementRate: Number,
    contentStyle: String,
    postingFrequency: String
  },
  
  // Pricing (Step 4)
  pricing: {
    instagramPrice: Number,
    tiktokPrice: Number,
    storyPrice: Number,
    youtubePrice: Number
  },
  
  communications: [String],
  additionalNotes: String,
  
  // Campaign Related Data
  stats: {
    totalCampaigns: { type: Number, default: 0 },
    completedCampaigns: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  },
  
  // Application/Invitation History
  campaignApplications: [{
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
  }],
  
  directInvitations: [{
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    invitedAt: { type: Date, default: Date.now }
  }],
  
  completedCampaigns: [{
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    review: String,
    earnings: Number,
    completedAt: { type: Date, default: Date.now }
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const InfluencerProfile = mongoose.model('InfluencerProfile', influencerProfileSchema);

export default InfluencerProfile;