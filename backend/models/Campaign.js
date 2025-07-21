import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true
  },
  
  // Campaign Basic Info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Campaign Details
  campaignType: {
    type: String,
    required: true,
    enum: [
      'sponsored-post', 'product-review', 'brand-ambassador', 
      'giveaway', 'event-coverage', 'tutorial', 'unboxing', 'other'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Fashion & Beauty', 'Lifestyle', 'Technology', 'Food & Beverage',
      'Travel', 'Fitness & Health', 'Gaming', 'Education', 'Business',
      'Entertainment', 'Home & Garden', 'Parenting', 'Sports', 'Other'
    ]
  },
  
  // Platform & Requirements
  platforms: [{
    type: String,
    enum: ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'twitch'],
    required: true
  }],
  requirements: {
    minFollowers: { type: Number, default: 0 },
    maxFollowers: { type: Number, default: null },
    minEngagementRate: { type: Number, default: 0 },
    ageRange: [String], // ['18-24', '25-34']
    gender: { type: String, enum: ['any', 'male', 'female'] },
    location: [String], // ['united-states', 'canada']
    niches: [String] // content niches required
  },
  
  // Budget & Timeline
  budget: {
    total: { type: Number, required: true },
    perInfluencer: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  timeline: {
    applicationDeadline: { type: Date, required: true },
    contentDeadline: { type: Date, required: true },
    campaignStart: { type: Date, required: true },
    campaignEnd: { type: Date, required: true }
  },
  
  // Content Guidelines
  contentGuidelines: {
    postType: [String], // ['photo', 'video', 'story', 'reel']
    contentLength: String, // for videos
    hashtags: [String],
    mentions: [String],
    keyMessages: [String],
    doNotInclude: [String],
    brandGuidelines: String
  },
  
  // Deliverables
  deliverables: [{
    type: String, // 'instagram-post', 'story', 'reel', 'youtube-video'
    quantity: Number,
    description: String
  }],
  
  // Campaign Status & Metrics
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  applicationsCount: { type: Number, default: 0 },
  selectedInfluencers: { type: Number, default: 0 },
  maxInfluencers: { type: Number, required: true },
  
  // Applications from Influencers
  applications: [{
    influencerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InfluencerProfile' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    proposedRate: Number,
    message: String,
    portfolioLinks: [String],
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    businessNotes: String
  }],
  
  // Direct Invitations Sent
  invitations: [{
    influencerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InfluencerProfile' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    proposedRate: Number,
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    sentAt: { type: Date, default: Date.now },
    respondedAt: Date
  }],
  
  // Campaign Performance
  performance: {
    totalReach: { type: Number, default: 0 },
    totalEngagement: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    totalConversions: { type: Number, default: 0 },
    roi: { type: Number, default: 0 }
  },
  
  // Featured/Priority
  isFeatured: { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  
}, {
  timestamps: true
});

// Indexes for better performance
campaignSchema.index({ businessId: 1, status: 1 });
campaignSchema.index({ status: 1, category: 1 });
campaignSchema.index({ 'timeline.applicationDeadline': 1 });
campaignSchema.index({ platforms: 1, category: 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;