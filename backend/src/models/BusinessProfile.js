import mongoose from 'mongoose';

const businessProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please enter a valid website URL'
    }
  },
  industry: {
    type: String,
    enum: {
      values: [
        'fashion', 'beauty', 'fitness', 'food', 'travel', 'technology',
        'gaming', 'music', 'art', 'education', 'business', 'finance',
        'health', 'parenting', 'pets', 'sports', 'automotive', 'home',
        'sustainability', 'luxury', 'e_commerce', 'saas', 'consulting',
        'real_estate', 'entertainment', 'non_profit', 'government', 'other'
      ],
      message: 'Please select a valid industry'
    },
    required: [true, 'Industry is required']
  },
  companySize: {
    type: String,
    enum: {
      values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      message: 'Please select a valid company size'
    },
    required: [true, 'Company size is required']
  },
  location: {
    address: {
      type: String,
      trim: true
    },
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
      required: [true, 'Country is required'],
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    timezone: {
      type: String,
      trim: true
    }
  },
  contactInfo: {
    primaryContact: {
      name: {
        type: String,
        required: [true, 'Primary contact name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Primary contact email is required'],
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        trim: true
      },
      position: {
        type: String,
        trim: true
      }
    },
    socialMedia: {
      instagram: String,
      twitter: String,
      facebook: String,
      linkedin: String,
      youtube: String,
      tiktok: String
    }
  },
  idealCustomerProfile: {
    type: String,
    maxlength: [500, 'Ideal customer profile cannot exceed 500 characters'],
    trim: true
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
      interests: {
        type: [String],
        enum: [
          'lifestyle', 'fashion', 'beauty', 'fitness', 'food', 'travel',
          'technology', 'gaming', 'music', 'art', 'photography', 'comedy',
          'education', 'business', 'finance', 'health', 'parenting', 'pets',
          'sports', 'automotive', 'home', 'diy', 'books', 'movies',
          'sustainability', 'outdoors', 'luxury', 'budget', 'productivity'
        ],
        default: []
      }
    },
    geography: {
      countries: {
        type: [String],
        default: []
      },
      languages: {
        type: [String],
        default: []
      }
    },
    platforms: {
      type: [String],
      enum: ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'twitch', 'pinterest'],
      default: []
    }
  },
  campaignPreferences: {
    preferredCampaignTypes: {
      type: [String],
      enum: ['sponsored_post', 'story', 'video', 'reel', 'collaboration', 'review', 'giveaway', 'takeover'],
      default: []
    },
    budgetRange: {
      min: {
        type: Number,
        min: [0, 'Minimum budget cannot be negative'],
        default: 0
      },
      max: {
        type: Number,
        min: [0, 'Maximum budget cannot be negative'],
        default: 0
      },
      currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'],
        default: 'USD'
      }
    },
    collaborationStyle: {
      type: String,
      enum: ['hands_on', 'collaborative', 'hands_off'],
      default: 'collaborative'
    },
    contentApproval: {
      type: String,
      enum: ['pre_approval', 'post_approval', 'no_approval'],
      default: 'pre_approval'
    },
    deliveryTimeline: {
      type: String,
      enum: ['within_week', 'within_month', 'flexible'],
      default: 'within_month'
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
        enum: ['business_license', 'tax_certificate', 'company_registration', 'id_verification'],
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
  paymentInfo: {
    preferredPaymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'paypal', 'stripe', 'crypto'],
      default: 'credit_card'
    },
    billingAddress: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    taxInfo: {
      taxId: String,
      vatNumber: String,
      taxExempt: {
        type: Boolean,
        default: false
      }
    }
  },
  stats: {
    campaignsPosted: {
      type: Number,
      default: 0
    },
    campaignsCompleted: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating cannot be less than 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      min: [0, 'Response rate cannot be negative'],
      max: [100, 'Response rate cannot exceed 100'],
      default: 100
    },
    averageResponseTime: {
      type: Number, // in hours
      default: 24
    }
  },
  preferences: {
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      smsNotifications: {
        type: Boolean,
        default: false
      },
      pushNotifications: {
        type: Boolean,
        default: true
      },
      weeklyDigest: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showCompanyInfo: {
        type: Boolean,
        default: true
      },
      showContactInfo: {
        type: Boolean,
        default: false
      },
      allowDirectMessages: {
        type: Boolean,
        default: true
      }
    },
    matching: {
      autoMatchEnabled: {
        type: Boolean,
        default: true
      },
      matchingCriteria: {
        minFollowers: {
          type: Number,
          min: [0, 'Minimum followers cannot be negative'],
          default: 1000
        },
        maxFollowers: {
          type: Number,
          min: [0, 'Maximum followers cannot be negative'],
          default: 100000
        },
        minEngagementRate: {
          type: Number,
          min: [0, 'Minimum engagement rate cannot be negative'],
          max: [100, 'Engagement rate cannot exceed 100'],
          default: 2
        },
        verifiedOnly: {
          type: Boolean,
          default: false
        }
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    features: {
      maxActiveCampaigns: {
        type: Number,
        default: 1
      },
      maxInfluencersPerCampaign: {
        type: Number,
        default: 5
      },
      advancedAnalytics: {
        type: Boolean,
        default: false
      },
      prioritySupport: {
        type: Boolean,
        default: false
      },
      customBranding: {
        type: Boolean,
        default: false
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
businessProfileSchema.index({ userId: 1 });
businessProfileSchema.index({ industry: 1 });
businessProfileSchema.index({ 'location.country': 1 });
businessProfileSchema.index({ 'stats.averageRating': -1 });
businessProfileSchema.index({ 'verificationStatus.isVerified': 1 });
businessProfileSchema.index({ 'subscription.plan': 1 });
businessProfileSchema.index({ isActive: 1 });
businessProfileSchema.index({ createdAt: -1 });

// Compound indexes for common queries
businessProfileSchema.index({ industry: 1, 'location.country': 1 });
businessProfileSchema.index({ 'subscription.plan': 1, isActive: 1 });

// Virtual for user population
businessProfileSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for campaign completion rate
businessProfileSchema.virtual('completionRate').get(function() {
  if (this.stats.campaignsPosted === 0) return 0;
  return (this.stats.campaignsCompleted / this.stats.campaignsPosted) * 100;
});

// Virtual for subscription status
businessProfileSchema.virtual('subscriptionStatus').get(function() {
  if (!this.subscription.isActive) return 'inactive';
  if (this.subscription.endDate && this.subscription.endDate < new Date()) return 'expired';
  return 'active';
});

// Pre-save middleware to check if profile is complete
businessProfileSchema.pre('save', function(next) {
  const requiredFields = [
    'companyName', 'industry', 'companySize', 'location.country',
    'contactInfo.primaryContact.name', 'contactInfo.primaryContact.email'
  ];
  
  this.isProfileComplete = requiredFields.every(field => {
    const value = field.includes('.') ? 
      field.split('.').reduce((obj, key) => obj && obj[key], this) : 
      this[field];
    
    return value && value.toString().trim().length > 0;
  });
  
  next();
});

// Pre-save middleware to set subscription end date for free plan
businessProfileSchema.pre('save', function(next) {
  if (this.subscription.plan === 'free' && !this.subscription.endDate) {
    this.subscription.endDate = null; // Free plan doesn't expire
  }
  next();
});

// Instance method to update subscription
businessProfileSchema.methods.updateSubscription = function(plan, duration = null) {
  this.subscription.plan = plan;
  this.subscription.startDate = new Date();
  
  if (duration && plan !== 'free') {
    this.subscription.endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
  }
  
  // Set features based on plan
  const planFeatures = {
    free: {
      maxActiveCampaigns: 1,
      maxInfluencersPerCampaign: 5,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false
    },
    basic: {
      maxActiveCampaigns: 3,
      maxInfluencersPerCampaign: 15,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false
    },
    premium: {
      maxActiveCampaigns: 10,
      maxInfluencersPerCampaign: 50,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true
    },
    enterprise: {
      maxActiveCampaigns: -1, // unlimited
      maxInfluencersPerCampaign: -1, // unlimited
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true
    }
  };
  
  this.subscription.features = planFeatures[plan];
  this.subscription.isActive = true;
};

// Instance method to check if feature is available
businessProfileSchema.methods.hasFeature = function(feature) {
  return this.subscription.features[feature] === true;
};

// Instance method to check campaign limits
businessProfileSchema.methods.canCreateCampaign = function() {
  if (this.subscription.features.maxActiveCampaigns === -1) return true;
  return this.stats.campaignsPosted < this.subscription.features.maxActiveCampaigns;
};

// Static method to find by industry
businessProfileSchema.statics.findByIndustry = function(industry) {
  return this.find({ industry, isActive: true });
};

// Static method to find by location
businessProfileSchema.statics.findByLocation = function(country, state = null) {
  const query = { 'location.country': country, isActive: true };
  if (state) query['location.state'] = state;
  return this.find(query);
};

// Static method to find verified businesses
businessProfileSchema.statics.findVerified = function() {
  return this.find({ 'verificationStatus.isVerified': true, isActive: true });
};

// Static method to find by subscription plan
businessProfileSchema.statics.findBySubscriptionPlan = function(plan) {
  return this.find({ 'subscription.plan': plan, isActive: true });
};

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema);

export default BusinessProfile;