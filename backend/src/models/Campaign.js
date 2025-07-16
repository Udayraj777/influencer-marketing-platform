import mongoose from 'mongoose';

const deliverableSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: {
      values: ['sponsored_post', 'story', 'video', 'reel', 'collaboration', 'review', 'giveaway', 'takeover'],
      message: 'Please select a valid deliverable type'
    },
    required: true
  },
  quantity: {
    type: Number,
    min: [1, 'Quantity must be at least 1'],
    required: true
  },
  specifications: {
    platform: {
      type: String,
      enum: ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'twitch', 'pinterest'],
      required: true
    },
    duration: {
      type: Number, // in seconds for videos
      min: [0, 'Duration cannot be negative']
    },
    dimensions: {
      width: Number,
      height: Number
    },
    hashtags: {
      required: [String],
      optional: [String]
    },
    mentions: [String],
    contentGuidelines: {
      type: String,
      maxlength: [1000, 'Content guidelines cannot exceed 1000 characters']
    },
    dueDate: {
      type: Date,
      required: true
    }
  },
  compensation: {
    amount: {
      type: Number,
      min: [0, 'Compensation amount cannot be negative'],
      required: true
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'],
      default: 'USD'
    },
    paymentType: {
      type: String,
      enum: ['fixed', 'per_post', 'per_view', 'per_engagement'],
      default: 'fixed'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'approved', 'rejected'],
    default: 'pending'
  },
  submissionUrl: {
    type: String,
    default: null
  },
  submittedAt: {
    type: Date,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  }
}, {
  _id: false
});

const applicationSchema = new mongoose.Schema({
  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proposalMessage: {
    type: String,
    required: [true, 'Proposal message is required'],
    maxlength: [1000, 'Proposal message cannot exceed 1000 characters']
  },
  proposedRate: {
    amount: {
      type: Number,
      min: [0, 'Proposed rate cannot be negative'],
      required: true
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'],
      default: 'USD'
    }
  },
  timeline: {
    type: String,
    enum: ['within_week', 'within_2_weeks', 'within_month', 'flexible'],
    required: true
  },
  portfolioItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InfluencerProfile.portfolio'
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date,
    default: null
  },
  responseMessage: {
    type: String,
    maxlength: [500, 'Response message cannot exceed 500 characters']
  }
}, {
  _id: true
});

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  completedAt: {
    type: Date,
    default: null
  },
  deliverables: [deliverableSchema]
}, {
  _id: true
});

const campaignSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [100, 'Campaign title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    trim: true,
    maxlength: [2000, 'Campaign description cannot exceed 2000 characters']
  },
  goal: {
    type: String,
    enum: {
      values: ['brand_awareness', 'lead_generation', 'sales', 'engagement', 'reach', 'website_traffic', 'app_downloads', 'other'],
      message: 'Please select a valid campaign goal'
    },
    required: [true, 'Campaign goal is required']
  },
  category: {
    type: String,
    enum: [
      'lifestyle', 'fashion', 'beauty', 'fitness', 'food', 'travel',
      'technology', 'gaming', 'music', 'art', 'photography', 'comedy',
      'education', 'business', 'finance', 'health', 'parenting', 'pets',
      'sports', 'automotive', 'home', 'diy', 'books', 'movies',
      'sustainability', 'outdoors', 'luxury', 'budget', 'productivity'
    ],
    required: [true, 'Campaign category is required']
  },
  targetAudience: {
    demographics: {
      ageRanges: {
        type: [String],
        enum: ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
        default: []
      },
      genders: {
        type: [String],
        enum: ['male', 'female', 'other'],
        default: []
      },
      interests: [String],
      languages: [String]
    },
    geography: {
      countries: [String],
      states: [String],
      cities: [String]
    },
    platforms: {
      type: [String],
      enum: ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'twitch', 'pinterest'],
      required: [true, 'At least one platform is required']
    }
  },
  influencerRequirements: {
    followerRange: {
      min: {
        type: Number,
        min: [0, 'Minimum followers cannot be negative'],
        default: 1000
      },
      max: {
        type: Number,
        min: [0, 'Maximum followers cannot be negative'],
        default: 100000
      }
    },
    engagementRate: {
      min: {
        type: Number,
        min: [0, 'Minimum engagement rate cannot be negative'],
        max: [100, 'Engagement rate cannot exceed 100'],
        default: 2
      }
    },
    location: {
      countries: [String],
      states: [String],
      cities: [String]
    },
    niches: {
      type: [String],
      enum: [
        'lifestyle', 'fashion', 'beauty', 'fitness', 'food', 'travel',
        'technology', 'gaming', 'music', 'art', 'photography', 'comedy',
        'education', 'business', 'finance', 'health', 'parenting', 'pets',
        'sports', 'automotive', 'home', 'diy', 'books', 'movies',
        'sustainability', 'outdoors', 'luxury', 'budget', 'productivity'
      ],
      default: []
    },
    verifiedOnly: {
      type: Boolean,
      default: false
    },
    previousBrandCollaborations: {
      type: String,
      enum: ['required', 'preferred', 'not_required'],
      default: 'not_required'
    }
  },
  budgetRange: {
    min: {
      type: Number,
      min: [0, 'Minimum budget cannot be negative'],
      required: true
    },
    max: {
      type: Number,
      min: [0, 'Maximum budget cannot be negative'],
      required: true
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'],
      default: 'USD'
    },
    isNegotiable: {
      type: Boolean,
      default: true
    }
  },
  timeline: {
    applicationDeadline: {
      type: Date,
      required: true
    },
    campaignStart: {
      type: Date,
      required: true
    },
    campaignEnd: {
      type: Date,
      required: true
    },
    contentDeadline: {
      type: Date,
      required: true
    }
  },
  deliverables: [deliverableSchema],
  milestones: [milestoneSchema],
  applications: [applicationSchema],
  selectedInfluencers: [{
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    selectedAt: {
      type: Date,
      default: Date.now
    },
    contractSigned: {
      type: Boolean,
      default: false
    },
    contractSignedAt: {
      type: Date,
      default: null
    },
    finalRate: {
      amount: {
        type: Number,
        min: [0, 'Final rate cannot be negative'],
        required: true
      },
      currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'],
        default: 'USD'
      }
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invited_only'],
    default: 'public'
  },
  assets: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'link'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    description: {
      type: String,
      maxlength: [200, 'Asset description cannot exceed 200 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  collaboration: {
    style: {
      type: String,
      enum: ['hands_on', 'collaborative', 'hands_off'],
      default: 'collaborative'
    },
    contentApproval: {
      type: String,
      enum: ['pre_approval', 'post_approval', 'no_approval'],
      default: 'pre_approval'
    },
    communicationPreference: {
      type: String,
      enum: ['email', 'platform_messaging', 'video_calls', 'phone_calls'],
      default: 'platform_messaging'
    },
    feedbackTimeline: {
      type: String,
      enum: ['24_hours', '48_hours', '72_hours', '1_week'],
      default: '48_hours'
    }
  },
  performance: {
    totalReach: {
      type: Number,
      default: 0
    },
    totalImpressions: {
      type: Number,
      default: 0
    },
    totalEngagements: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    costPerEngagement: {
      type: Number,
      default: 0
    },
    roi: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: [1, 'Rating cannot be less than 1'],
      max: [5, 'Rating cannot exceed 5'],
      required: true
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    averageApplicationTime: {
      type: Number, // in hours
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
campaignSchema.index({ businessId: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ 'targetAudience.platforms': 1 });
campaignSchema.index({ 'timeline.applicationDeadline': 1 });
campaignSchema.index({ 'timeline.campaignStart': 1 });
campaignSchema.index({ 'budgetRange.min': 1, 'budgetRange.max': 1 });
campaignSchema.index({ 'influencerRequirements.followerRange.min': 1, 'influencerRequirements.followerRange.max': 1 });
campaignSchema.index({ isActive: 1 });
campaignSchema.index({ isFeatured: 1 });
campaignSchema.index({ createdAt: -1 });

// Compound indexes for common queries
campaignSchema.index({ status: 1, category: 1 });
campaignSchema.index({ 'targetAudience.platforms': 1, status: 1 });
campaignSchema.index({ 'influencerRequirements.niches': 1, status: 1 });
campaignSchema.index({ isActive: 1, status: 1, createdAt: -1 });

// Virtual for business profile population
campaignSchema.virtual('business', {
  ref: 'User',
  localField: 'businessId',
  foreignField: '_id',
  justOne: true
});

// Virtual for application count
campaignSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

// Virtual for selected influencer count
campaignSchema.virtual('selectedInfluencerCount').get(function() {
  return this.selectedInfluencers.length;
});

// Virtual for days until deadline
campaignSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.timeline.applicationDeadline) return null;
  const now = new Date();
  const deadline = new Date(this.timeline.applicationDeadline);
  const timeDiff = deadline.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for campaign progress
campaignSchema.virtual('progress').get(function() {
  const now = new Date();
  const start = new Date(this.timeline.campaignStart);
  const end = new Date(this.timeline.campaignEnd);
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.round((elapsed / totalDuration) * 100);
});

// Virtual for average rating
campaignSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / this.reviews.length;
});

// Pre-save middleware to validate timeline
campaignSchema.pre('save', function(next) {
  if (this.timeline.applicationDeadline >= this.timeline.campaignStart) {
    return next(new Error('Application deadline must be before campaign start date'));
  }
  if (this.timeline.campaignStart >= this.timeline.campaignEnd) {
    return next(new Error('Campaign start date must be before campaign end date'));
  }
  if (this.timeline.contentDeadline <= this.timeline.campaignEnd) {
    return next(new Error('Content deadline must be after campaign end date'));
  }
  next();
});

// Pre-save middleware to validate budget range
campaignSchema.pre('save', function(next) {
  if (this.budgetRange.min > this.budgetRange.max) {
    return next(new Error('Minimum budget cannot be greater than maximum budget'));
  }
  next();
});

// Pre-save middleware to validate follower range
campaignSchema.pre('save', function(next) {
  if (this.influencerRequirements.followerRange.min > this.influencerRequirements.followerRange.max) {
    return next(new Error('Minimum followers cannot be greater than maximum followers'));
  }
  next();
});

// Pre-save middleware to update metadata
campaignSchema.pre('save', function(next) {
  this.metadata.applications = this.applications.length;
  next();
});

// Instance method to add application
campaignSchema.methods.addApplication = function(applicationData) {
  // Check if influencer already applied
  const existingApplication = this.applications.find(
    app => app.influencerId.toString() === applicationData.influencerId.toString()
  );
  
  if (existingApplication) {
    throw new Error('Influencer has already applied to this campaign');
  }
  
  // Check if application deadline has passed
  if (new Date() > this.timeline.applicationDeadline) {
    throw new Error('Application deadline has passed');
  }
  
  this.applications.push(applicationData);
  this.metadata.applications = this.applications.length;
};

// Instance method to accept application
campaignSchema.methods.acceptApplication = function(applicationId, finalRate) {
  const application = this.applications.id(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  
  application.status = 'accepted';
  application.respondedAt = new Date();
  
  // Add to selected influencers
  this.selectedInfluencers.push({
    influencerId: application.influencerId,
    finalRate: finalRate
  });
};

// Instance method to reject application
campaignSchema.methods.rejectApplication = function(applicationId, responseMessage) {
  const application = this.applications.id(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  
  application.status = 'rejected';
  application.respondedAt = new Date();
  application.responseMessage = responseMessage;
};

// Instance method to add review
campaignSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
};

// Instance method to update performance metrics
campaignSchema.methods.updatePerformanceMetrics = function(metrics) {
  Object.assign(this.performance, metrics);
};

// Static method to find active campaigns
campaignSchema.statics.findActive = function() {
  return this.find({ status: 'active', isActive: true });
};

// Static method to find by category
campaignSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active', isActive: true });
};

// Static method to find by budget range
campaignSchema.statics.findByBudgetRange = function(minBudget, maxBudget) {
  return this.find({
    'budgetRange.min': { $gte: minBudget },
    'budgetRange.max': { $lte: maxBudget },
    status: 'active',
    isActive: true
  });
};

// Static method to find campaigns for influencer
campaignSchema.statics.findForInfluencer = function(influencerProfile) {
  const query = {
    status: 'active',
    isActive: true,
    'timeline.applicationDeadline': { $gt: new Date() }
  };
  
  // Filter by niches if specified
  if (influencerProfile.niches && influencerProfile.niches.length > 0) {
    query['influencerRequirements.niches'] = { $in: influencerProfile.niches };
  }
  
  // Filter by follower range
  if (influencerProfile.stats.totalFollowers) {
    query['influencerRequirements.followerRange.min'] = { $lte: influencerProfile.stats.totalFollowers };
    query['influencerRequirements.followerRange.max'] = { $gte: influencerProfile.stats.totalFollowers };
  }
  
  return this.find(query);
};

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;