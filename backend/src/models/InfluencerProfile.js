import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: {
      values: ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'twitch', 'pinterest'],
      message: 'Platform must be one of: instagram, tiktok, youtube, twitter, facebook, linkedin, twitch, pinterest'
    },
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  followers: {
    type: Number,
    min: [0, 'Followers count cannot be negative'],
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  _id: false
});

const audienceInsightSchema = new mongoose.Schema({
  ageRange: {
    type: String,
    enum: ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    required: true
  },
  percentage: {
    type: Number,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100'],
    required: true
  }
}, {
  _id: false
});

const locationInsightSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    trim: true
  },
  percentage: {
    type: Number,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100'],
    required: true
  }
}, {
  _id: false
});

const influencerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  socialLinks: {
    type: [socialLinkSchema],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one social media link is required'
    }
  },
  niches: {
    type: [String],
    enum: {
      values: [
        'lifestyle', 'fashion', 'beauty', 'fitness', 'food', 'travel',
        'technology', 'gaming', 'music', 'art', 'photography', 'comedy',
        'education', 'business', 'finance', 'health', 'parenting', 'pets',
        'sports', 'automotive', 'home', 'diy', 'books', 'movies',
        'sustainability', 'outdoors', 'luxury', 'budget', 'productivity'
      ],
      message: 'Please select valid niches'
    },
    validate: {
      validator: function(v) {
        return v.length > 0 && v.length <= 5;
      },
      message: 'Please select 1-5 niches'
    }
  },
  audienceDescription: {
    type: String,
    maxlength: [300, 'Audience description cannot exceed 300 characters'],
    trim: true
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    timezone: {
      type: String,
      trim: true
    }
  },
  demographics: {
    genderSplit: {
      male: {
        type: Number,
        min: [0, 'Percentage cannot be negative'],
        max: [100, 'Percentage cannot exceed 100'],
        default: 0
      },
      female: {
        type: Number,
        min: [0, 'Percentage cannot be negative'],
        max: [100, 'Percentage cannot exceed 100'],
        default: 0
      },
      other: {
        type: Number,
        min: [0, 'Percentage cannot be negative'],
        max: [100, 'Percentage cannot exceed 100'],
        default: 0
      }
    },
    ageDistribution: [audienceInsightSchema],
    topCountries: [locationInsightSchema]
  },
  rates: {
    postRate: {
      type: Number,
      min: [0, 'Rate cannot be negative'],
      default: 0
    },
    storyRate: {
      type: Number,
      min: [0, 'Rate cannot be negative'],
      default: 0
    },
    videoRate: {
      type: Number,
      min: [0, 'Rate cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'],
      default: 'USD'
    }
  },
  portfolio: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Portfolio title cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [300, 'Portfolio description cannot exceed 300 characters']
    },
    imageUrl: {
      type: String,
      required: true
    },
    campaignType: {
      type: String,
      enum: ['sponsored_post', 'story', 'video', 'reel', 'collaboration', 'review'],
      required: true
    },
    brandName: {
      type: String,
      trim: true
    },
    metrics: {
      views: Number,
      likes: Number,
      comments: Number,
      shares: Number,
      saves: Number,
      engagementRate: Number
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    weeklyCapacity: {
      type: Number,
      min: [1, 'Weekly capacity must be at least 1'],
      max: [20, 'Weekly capacity cannot exceed 20'],
      default: 5
    },
    responseTime: {
      type: String,
      enum: ['within_hour', 'within_day', 'within_week'],
      default: 'within_day'
    }
  },
  verificationStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verificationDocuments: [{
      type: {
        type: String,
        enum: ['id_card', 'passport', 'social_verification', 'business_license'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  stats: {
    totalFollowers: {
      type: Number,
      default: 0
    },
    averageEngagementRate: {
      type: Number,
      default: 0
    },
    campaignsCompleted: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: [1, 'Rating cannot be less than 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    preferredCampaignTypes: {
      type: [String],
      enum: ['sponsored_post', 'story', 'video', 'reel', 'collaboration', 'review', 'giveaway', 'takeover'],
      default: []
    },
    minBudget: {
      type: Number,
      min: [0, 'Minimum budget cannot be negative'],
      default: 0
    },
    maxBudget: {
      type: Number,
      min: [0, 'Maximum budget cannot be negative'],
      default: 0
    },
    preferredBrands: [String],
    blacklistedBrands: [String],
    workingHours: {
      timezone: String,
      days: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      startTime: {
        type: String,
        default: '09:00'
      },
      endTime: {
        type: String,
        default: '17:00'
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
influencerProfileSchema.index({ userId: 1 });
influencerProfileSchema.index({ niches: 1 });
influencerProfileSchema.index({ 'location.country': 1 });
influencerProfileSchema.index({ 'stats.totalFollowers': -1 });
influencerProfileSchema.index({ 'stats.rating': -1 });
influencerProfileSchema.index({ 'availability.status': 1 });
influencerProfileSchema.index({ 'verificationStatus.isVerified': 1 });
influencerProfileSchema.index({ isActive: 1 });
influencerProfileSchema.index({ createdAt: -1 });

// Compound indexes for common queries
influencerProfileSchema.index({ niches: 1, 'stats.totalFollowers': -1 });
influencerProfileSchema.index({ 'location.country': 1, niches: 1 });
influencerProfileSchema.index({ 'availability.status': 1, 'stats.rating': -1 });

// Virtual for user population
influencerProfileSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for calculating total followers across all platforms
influencerProfileSchema.virtual('totalFollowersCalculated').get(function() {
  return this.socialLinks.reduce((total, link) => total + (link.followers || 0), 0);
});

// Virtual for primary social platform
influencerProfileSchema.virtual('primarySocialPlatform').get(function() {
  return this.socialLinks.find(link => link.isPrimary) || this.socialLinks[0];
});

// Pre-save middleware to calculate total followers
influencerProfileSchema.pre('save', function(next) {
  this.stats.totalFollowers = this.totalFollowersCalculated;
  next();
});

// Pre-save middleware to check if profile is complete
influencerProfileSchema.pre('save', function(next) {
  const requiredFields = [
    'bio', 'socialLinks', 'niches', 'audienceDescription', 'location.country'
  ];
  
  this.isProfileComplete = requiredFields.every(field => {
    const value = field.includes('.') ? 
      field.split('.').reduce((obj, key) => obj && obj[key], this) : 
      this[field];
    
    return value && (Array.isArray(value) ? value.length > 0 : true);
  }) && this.socialLinks.length > 0;
  
  next();
});

// Instance method to update engagement rate
influencerProfileSchema.methods.updateEngagementRate = function() {
  if (this.portfolio.length > 0) {
    const totalEngagement = this.portfolio.reduce((sum, item) => {
      return sum + (item.metrics?.engagementRate || 0);
    }, 0);
    this.stats.averageEngagementRate = totalEngagement / this.portfolio.length;
  }
};

// Instance method to add portfolio item
influencerProfileSchema.methods.addPortfolioItem = function(portfolioData) {
  this.portfolio.push(portfolioData);
  this.updateEngagementRate();
};

// Static method to find by niche
influencerProfileSchema.statics.findByNiche = function(niche) {
  return this.find({ niches: niche, isActive: true });
};

// Static method to find by location
influencerProfileSchema.statics.findByLocation = function(country, state = null) {
  const query = { 'location.country': country, isActive: true };
  if (state) query['location.state'] = state;
  return this.find(query);
};

// Static method to find verified influencers
influencerProfileSchema.statics.findVerified = function() {
  return this.find({ 'verificationStatus.isVerified': true, isActive: true });
};

const InfluencerProfile = mongoose.model('InfluencerProfile', influencerProfileSchema);

export default InfluencerProfile;