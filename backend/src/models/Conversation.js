import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    validate: {
      validator: function(v) {
        return v.length === 2;
      },
      message: 'Conversation must have exactly 2 participants'
    }
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null
  },
  type: {
    type: String,
    enum: ['direct', 'campaign_related', 'support'],
    default: 'direct'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  metadata: {
    subject: {
      type: String,
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    tags: [String],
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  settings: {
    isTypingEnabled: {
      type: Boolean,
      default: true
    },
    readReceiptsEnabled: {
      type: Boolean,
      default: true
    },
    notificationsEnabled: {
      type: Map,
      of: Boolean,
      default: new Map()
    }
  },
  blockedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    blockedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      maxlength: [200, 'Block reason cannot exceed 200 characters']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ campaignId: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ isActive: 1 });
conversationSchema.index({ createdAt: -1 });

// Compound indexes for common queries
conversationSchema.index({ participants: 1, status: 1 });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ campaignId: 1, participants: 1 });
conversationSchema.index({ status: 1, lastMessageAt: -1 });

// Virtual for participant population
conversationSchema.virtual('participantUsers', {
  ref: 'User',
  localField: 'participants',
  foreignField: '_id'
});

// Virtual for campaign population
conversationSchema.virtual('campaign', {
  ref: 'Campaign',
  localField: 'campaignId',
  foreignField: '_id',
  justOne: true
});

// Virtual for last message population
conversationSchema.virtual('lastMessageDetails', {
  ref: 'Message',
  localField: 'lastMessage',
  foreignField: '_id',
  justOne: true
});

// Virtual to check if conversation is blocked
conversationSchema.virtual('isBlocked').get(function() {
  return this.blockedBy.length > 0;
});

// Virtual to get the other participant for a given user
conversationSchema.virtual('getOtherParticipant').get(function() {
  return function(userId) {
    return this.participants.find(p => p.toString() !== userId.toString());
  }.bind(this);
});

// Pre-save middleware to initialize unread counts
conversationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.participants.forEach(participantId => {
      this.unreadCount.set(participantId.toString(), 0);
      this.settings.notificationsEnabled.set(participantId.toString(), true);
    });
  }
  next();
});

// Pre-save middleware to ensure participants are unique
conversationSchema.pre('save', function(next) {
  const uniqueParticipants = [...new Set(this.participants.map(p => p.toString()))];
  if (uniqueParticipants.length !== this.participants.length) {
    return next(new Error('Participants must be unique'));
  }
  next();
});

// Instance method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Instance method to get other participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.toString() !== userId.toString());
};

// Instance method to increment unread count
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
};

// Instance method to reset unread count
conversationSchema.methods.resetUnreadCount = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
};

// Instance method to get unread count for user
conversationSchema.methods.getUnreadCount = function(userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

// Instance method to block conversation
conversationSchema.methods.blockConversation = function(userId, reason = null) {
  const existingBlock = this.blockedBy.find(b => b.userId.toString() === userId.toString());
  
  if (!existingBlock) {
    this.blockedBy.push({
      userId: userId,
      reason: reason,
      blockedAt: new Date()
    });
    this.status = 'blocked';
  }
};

// Instance method to unblock conversation
conversationSchema.methods.unblockConversation = function(userId) {
  this.blockedBy = this.blockedBy.filter(b => b.userId.toString() !== userId.toString());
  
  if (this.blockedBy.length === 0) {
    this.status = 'active';
  }
};

// Instance method to check if blocked by user
conversationSchema.methods.isBlockedBy = function(userId) {
  return this.blockedBy.some(b => b.userId.toString() === userId.toString());
};

// Instance method to update last message
conversationSchema.methods.updateLastMessage = function(messageId) {
  this.lastMessage = messageId;
  this.lastMessageAt = new Date();
};

// Instance method to enable/disable notifications for user
conversationSchema.methods.setNotifications = function(userId, enabled) {
  this.settings.notificationsEnabled.set(userId.toString(), enabled);
};

// Instance method to check if notifications are enabled for user
conversationSchema.methods.areNotificationsEnabled = function(userId) {
  return this.settings.notificationsEnabled.get(userId.toString()) !== false;
};

// Instance method to add tag
conversationSchema.methods.addTag = function(tag) {
  if (!this.metadata.tags.includes(tag)) {
    this.metadata.tags.push(tag);
  }
};

// Instance method to remove tag
conversationSchema.methods.removeTag = function(tag) {
  this.metadata.tags = this.metadata.tags.filter(t => t !== tag);
};

// Instance method to archive conversation
conversationSchema.methods.archive = function() {
  this.status = 'archived';
};

// Instance method to unarchive conversation
conversationSchema.methods.unarchive = function() {
  this.status = 'active';
};

// Static method to find conversation between two users
conversationSchema.statics.findBetweenUsers = function(userId1, userId2) {
  return this.findOne({
    participants: { $all: [userId1, userId2] },
    isActive: true
  });
};

// Static method to find user's conversations
conversationSchema.statics.findUserConversations = function(userId, status = 'active') {
  const query = {
    participants: userId,
    isActive: true
  };
  
  if (status !== 'all') {
    query.status = status;
  }
  
  return this.find(query)
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name email role')
    .populate('lastMessageDetails', 'content type createdAt senderId')
    .populate('campaign', 'title status');
};

// Static method to find campaign conversations
conversationSchema.statics.findCampaignConversations = function(campaignId) {
  return this.find({
    campaignId: campaignId,
    isActive: true
  })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name email role')
    .populate('lastMessageDetails', 'content type createdAt senderId');
};

// Static method to create conversation between users
conversationSchema.statics.createConversation = function(userId1, userId2, campaignId = null, type = 'direct') {
  // Check if conversation already exists
  return this.findBetweenUsers(userId1, userId2)
    .then(existingConversation => {
      if (existingConversation) {
        return existingConversation;
      }
      
      // Create new conversation
      const conversationData = {
        participants: [userId1, userId2],
        type: type
      };
      
      if (campaignId) {
        conversationData.campaignId = campaignId;
        conversationData.type = 'campaign_related';
      }
      
      return this.create(conversationData);
    });
};

// Static method to get user's unread conversations count
conversationSchema.statics.getUnreadConversationsCount = function(userId) {
  return this.countDocuments({
    participants: userId,
    [`unreadCount.${userId}`]: { $gt: 0 },
    status: 'active',
    isActive: true
  });
};

// Static method to mark all conversations as read for user
conversationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { participants: userId, isActive: true },
    { [`unreadCount.${userId}`]: 0 }
  );
};

// Static method to find conversations with unread messages
conversationSchema.statics.findUnreadConversations = function(userId) {
  return this.find({
    participants: userId,
    [`unreadCount.${userId}`]: { $gt: 0 },
    status: 'active',
    isActive: true
  })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name email role')
    .populate('lastMessageDetails', 'content type createdAt senderId');
};

// Static method to search conversations
conversationSchema.statics.searchConversations = function(userId, searchTerm) {
  return this.find({
    participants: userId,
    isActive: true,
    $or: [
      { 'metadata.subject': { $regex: searchTerm, $options: 'i' } },
      { 'metadata.tags': { $regex: searchTerm, $options: 'i' } },
      { 'metadata.notes': { $regex: searchTerm, $options: 'i' } }
    ]
  })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name email role')
    .populate('lastMessageDetails', 'content type createdAt senderId');
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;