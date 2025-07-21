import mongoose from 'mongoose';

const businessProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Info (Step 1)
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyDescription: {
    type: String,
    required: true,
    maxlength: 1000
  },
  companyLogo: {
    type: String, // URL to logo
    default: null
  },
  
  // Company Details (Step 2)
  industry: {
    type: String,
    required: true,
    enum: [
      'technology', 'fashion', 'fitness', 'food', 'travel', 
      'finance', 'automotive', 'entertainment', 'beauty', 
      'lifestyle', 'education', 'healthcare', 'other'
    ]
  },
  companySize: {
    type: String,
    required: true,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  website: {
    type: String,
    trim: true
  },
  headquarters: {
    type: String,
    required: true
  },
  
  // Contact & Social (Step 3)
  contactInfo: {
    contactPerson: String,
    phone: String,
    linkedinUrl: String,
    instagramUrl: String,
    twitterUrl: String
  },
  
  // Campaign Preferences (Step 4)
  campaignPreferences: {
    typicalBudget: {
      type: String,
      enum: ['500-2500', '2500-10000', '10000-50000', '50000+']
    },
    preferredPlatforms: [String],
    targetAudience: String,
    campaignTypes: [String], // sponsored posts, reviews, brand ambassadors, etc.
    collaborationStyle: String
  },
  
  // Campaign & Collaboration Stats
  stats: {
    totalCampaigns: { type: Number, default: 0 },
    activeCampaigns: { type: Number, default: 0 },
    completedCampaigns: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalInfluencersWorkedWith: { type: Number, default: 0 }
  },
  
  // Campaign History
  campaigns: [{
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    status: { type: String, enum: ['draft', 'active', 'completed', 'cancelled'] },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Influencer Interactions
  collaborations: [{
    influencerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InfluencerProfile' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    status: { type: String, enum: ['invited', 'applied', 'accepted', 'ongoing', 'completed'] },
    rating: Number,
    review: String,
    collaboratedAt: { type: Date, default: Date.now }
  }],
  
  // Direct Invitations Sent
  sentInvitations: [{
    influencerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InfluencerProfile' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    sentAt: { type: Date, default: Date.now }
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema);

export default BusinessProfile;