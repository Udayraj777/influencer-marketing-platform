import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'document', 'audio'],
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
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  }
}, {
  _id: false
});

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'audio', 'system'],
    default: 'text'
  },
  content: {
    type: String,
    required: function() {
      return this.type === 'text' || this.type === 'system';
    },
    maxlength: [2000, 'Message content cannot exceed 2000 characters'],
    trim: true
  },
  attachments: [attachmentSchema],
  metadata: {
    mentions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      displayName: {
        type: String,
        required: true
      },
      position: {
        start: Number,
        end: Number
      }
    }],
    links: [{
      url: {
        type: String,
        required: true
      },
      title: String,
      description: String,
      image: String,
      domain: String
    }],
    quotedMessage: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      },
      content: String,
      senderName: String
    },
    systemData: {
      type: {
        type: String,
        enum: [
          'user_joined', 'user_left', 'campaign_created', 'campaign_updated',
          'application_submitted', 'application_accepted', 'application_rejected',
          'deliverable_submitted', 'deliverable_approved', 'deliverable_rejected',
          'payment_sent', 'payment_received', 'conversation_archived'
        ]
      },
      data: mongoose.Schema.Types.Mixed
    }
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true,
      enum: ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '💯']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  scheduled: {
    isScheduled: {
      type: Boolean,
      default: false
    },
    sendAt: {
      type: Date,
      default: null
    }
  },
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
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ 'readBy.userId': 1 });
messageSchema.index({ 'deliveredTo.userId': 1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ isActive: 1 });
messageSchema.index({ 'scheduled.sendAt': 1 });

// Compound indexes for common queries
messageSchema.index({ conversationId: 1, isDeleted: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, type: 1 });

// Virtual for conversation population
messageSchema.virtual('conversation', {
  ref: 'Conversation',
  localField: 'conversationId',
  foreignField: '_id',
  justOne: true
});

// Virtual for sender population
messageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

// Virtual for quoted message population
messageSchema.virtual('quotedMessageDetails', {
  ref: 'Message',
  localField: 'metadata.quotedMessage.messageId',
  foreignField: '_id',
  justOne: true
});

// Virtual to check if message is read by all participants
messageSchema.virtual('isReadByAll').get(function() {
  return function(conversationParticipants) {
    const readByIds = this.readBy.map(r => r.userId.toString());
    return conversationParticipants.every(p => 
      p.toString() === this.senderId.toString() || readByIds.includes(p.toString())
    );
  }.bind(this);
});

// Virtual to get reaction counts
messageSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
  });
  return counts;
});

// Virtual to check if message has attachments
messageSchema.virtual('hasAttachments').get(function() {
  return this.attachments && this.attachments.length > 0;
});

// Virtual to get attachment count
messageSchema.virtual('attachmentCount').get(function() {
  return this.attachments ? this.attachments.length : 0;
});

// Virtual to get total attachment size
messageSchema.virtual('totalAttachmentSize').get(function() {
  return this.attachments ? this.attachments.reduce((total, att) => total + att.size, 0) : 0;
});

// Pre-save middleware to validate content based on type
messageSchema.pre('save', function(next) {
  if (this.type === 'text' && !this.content) {
    return next(new Error('Text messages must have content'));
  }
  
  if (this.type !== 'text' && this.type !== 'system' && (!this.attachments || this.attachments.length === 0)) {
    return next(new Error('Non-text messages must have attachments'));
  }
  
  next();
});

// Pre-save middleware to process mentions
messageSchema.pre('save', function(next) {
  if (this.type === 'text' && this.content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(this.content)) !== null) {
      mentions.push({
        position: {
          start: match.index,
          end: match.index + match[0].length
        },
        displayName: match[1]
      });
    }
    
    // Note: In a real implementation, you'd need to resolve usernames to user IDs
    // This is a simplified version for demonstration
  }
  
  next();
});

// Pre-save middleware to extract links
messageSchema.pre('save', function(next) {
  if (this.type === 'text' && this.content) {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = this.content.match(urlRegex);
    
    if (urls) {
      this.metadata.links = urls.map(url => ({
        url: url,
        domain: new URL(url).hostname
      }));
    }
  }
  
  next();
});

// Instance method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.userId.toString() === userId.toString());
  
  if (!existingRead) {
    this.readBy.push({
      userId: userId,
      readAt: new Date()
    });
  }
};

// Instance method to mark as delivered to user
messageSchema.methods.markAsDelivered = function(userId) {
  const existingDelivered = this.deliveredTo.find(d => d.userId.toString() === userId.toString());
  
  if (!existingDelivered) {
    this.deliveredTo.push({
      userId: userId,
      deliveredAt: new Date()
    });
  }
};

// Instance method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    userId: userId,
    emoji: emoji,
    createdAt: new Date()
  });
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = function(userId, emoji = null) {
  if (emoji) {
    this.reactions = this.reactions.filter(r => 
      !(r.userId.toString() === userId.toString() && r.emoji === emoji)
    );
  } else {
    this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  }
};

// Instance method to edit message
messageSchema.methods.editMessage = function(newContent) {
  // Save current content to history
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  // Update content
  this.content = newContent;
  this.isEdited = true;
};

// Instance method to soft delete message
messageSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.content = ''; // Clear content for privacy
  this.attachments = []; // Clear attachments
};

// Instance method to check if user can edit message
messageSchema.methods.canEdit = function(userId) {
  // Only sender can edit, and only within 5 minutes of sending
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.senderId.toString() === userId.toString() && 
         this.createdAt > fiveMinutesAgo && 
         !this.isDeleted;
};

// Instance method to check if user can delete message
messageSchema.methods.canDelete = function(userId) {
  // Sender can delete their own messages
  return this.senderId.toString() === userId.toString() && !this.isDeleted;
};

// Instance method to check if message is read by user
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(r => r.userId.toString() === userId.toString());
};

// Instance method to check if message is delivered to user
messageSchema.methods.isDeliveredTo = function(userId) {
  return this.deliveredTo.some(d => d.userId.toString() === userId.toString());
};

// Instance method to get user's reaction
messageSchema.methods.getUserReaction = function(userId) {
  return this.reactions.find(r => r.userId.toString() === userId.toString());
};

// Static method to find conversation messages
messageSchema.statics.findConversationMessages = function(conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    conversationId: conversationId,
    isDeleted: false,
    isActive: true
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email role')
    .populate('quotedMessageDetails', 'content senderId createdAt');
};

// Static method to find unread messages for user
messageSchema.statics.findUnreadMessages = function(userId) {
  return this.find({
    'readBy.userId': { $ne: userId },
    senderId: { $ne: userId },
    isDeleted: false,
    isActive: true
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email role')
    .populate('conversation', 'participants');
};

// Static method to mark multiple messages as read
messageSchema.statics.markMessagesAsRead = function(messageIds, userId) {
  return this.updateMany(
    { 
      _id: { $in: messageIds },
      'readBy.userId': { $ne: userId }
    },
    { 
      $push: { 
        readBy: { 
          userId: userId, 
          readAt: new Date() 
        } 
      } 
    }
  );
};

// Static method to search messages
messageSchema.statics.searchMessages = function(conversationId, searchTerm, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    conversationId: conversationId,
    content: { $regex: searchTerm, $options: 'i' },
    isDeleted: false,
    isActive: true
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email role');
};

// Static method to get message statistics
messageSchema.statics.getMessageStats = function(conversationId) {
  return this.aggregate([
    { $match: { conversationId: mongoose.Types.ObjectId(conversationId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        totalAttachments: { $sum: { $size: { $ifNull: ['$attachments', []] } } },
        messagesByType: {
          $push: {
            type: '$type',
            count: 1
          }
        },
        averageMessageLength: { $avg: { $strLenCP: '$content' } }
      }
    }
  ]);
};

// Static method to create system message
messageSchema.statics.createSystemMessage = function(conversationId, systemType, systemData, content) {
  return this.create({
    conversationId: conversationId,
    senderId: null, // System messages don't have a sender
    type: 'system',
    content: content,
    'metadata.systemData': {
      type: systemType,
      data: systemData
    }
  });
};

// Static method to get scheduled messages
messageSchema.statics.getScheduledMessages = function() {
  return this.find({
    'scheduled.isScheduled': true,
    'scheduled.sendAt': { $lte: new Date() },
    isActive: true
  });
};

const Message = mongoose.model('Message', messageSchema);

export default Message;