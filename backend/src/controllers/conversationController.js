import { validationResult } from 'express-validator';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Get user conversations
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Get conversations where user is a participant
    const [conversations, totalCount] = await Promise.all([
      Conversation.find({ participants: userId })
        .populate('participants', 'name email role')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Conversation.countDocuments({ participants: userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        conversations: conversations.map(c => c.toJSON()),
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    next(error);
  }
};

// Get conversation by ID
export const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email role');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        conversation: conversation.toJSON()
      }
    });
  } catch (error) {
    logger.error('Get conversation by ID error:', error);
    next(error);
  }
};

// Create new conversation
export const createConversation = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { participantId, subject, initialMessage } = req.body;
    const userId = req.user._id;

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Check if trying to create conversation with self
    if (participantId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if conversation already exists between these users
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      participants: { $size: 2 }
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: 'Conversation already exists',
        data: {
          conversation: existingConversation.toJSON()
        }
      });
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [userId, participantId],
      subject: subject || 'New Conversation',
      createdBy: userId
    });

    await conversation.save();

    // Create initial message if provided
    if (initialMessage) {
      const message = new Message({
        conversationId: conversation._id,
        senderId: userId,
        content: initialMessage,
        type: 'text'
      });

      await message.save();
      
      // Update conversation with last message
      conversation.lastMessage = message._id;
      await conversation.save();
    }

    // Populate conversation data
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email role')
      .populate('lastMessage');

    logger.info(`Conversation created between users: ${req.user.email} and ${participant.email}`);

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: {
        conversation: populatedConversation.toJSON()
      }
    });
  } catch (error) {
    logger.error('Create conversation error:', error);
    next(error);
  }
};

// Update conversation
export const updateConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { subject } = req.body;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }

    // Update conversation
    conversation.subject = subject || conversation.subject;
    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email role');

    logger.info(`Conversation updated by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Conversation updated successfully',
      data: {
        conversation: populatedConversation.toJSON()
      }
    });
  } catch (error) {
    logger.error('Update conversation error:', error);
    next(error);
  }
};

// Delete conversation
export const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }

    // Soft delete conversation
    conversation.isActive = false;
    await conversation.save();

    // Also soft delete all messages in the conversation
    await Message.updateMany(
      { conversationId: id },
      { isActive: false }
    );

    logger.info(`Conversation deleted by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    logger.error('Delete conversation error:', error);
    next(error);
  }
};

// Mark conversation as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }

    // Mark all messages in conversation as read for this user
    await Message.updateMany(
      { 
        conversationId: id,
        senderId: { $ne: userId },
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

    logger.info(`Conversation marked as read by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    logger.error('Mark conversation as read error:', error);
    next(error);
  }
};

// Get conversation participants
export const getConversationParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email role profileId');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        participants: conversation.participants.map(p => p.toJSON())
      }
    });
  } catch (error) {
    logger.error('Get conversation participants error:', error);
    next(error);
  }
};

// Get unread conversations count
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get conversations where user is participant
    const conversations = await Conversation.find({ 
      participants: userId,
      isActive: true 
    });

    let unreadCount = 0;

    // Check each conversation for unread messages
    for (const conversation of conversations) {
      const unreadMessages = await Message.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
        isActive: true
      });

      if (unreadMessages > 0) {
        unreadCount++;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    next(error);
  }
};