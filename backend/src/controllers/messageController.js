import { validationResult } from 'express-validator';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { logger } from '../utils/logger.js';
import { io } from '../../server.js';

// Send message
export const sendMessage = async (req, res, next) => {
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

    const { conversationId, content, type = 'text' } = req.body;
    const userId = req.user._id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }

    // Create new message
    const message = new Message({
      conversationId,
      senderId: userId,
      content,
      type
    });

    await message.save();

    // Update conversation with last message
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate message data
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name email role');

    // Emit message to conversation participants via Socket.IO
    io.to(`conversation-${conversationId}`).emit('new-message', {
      message: populatedMessage.toJSON(),
      conversationId
    });

    logger.info(`Message sent by user: ${req.user.email} in conversation: ${conversationId}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage.toJSON()
      }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

// Get messages for a conversation
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Get messages
    const [messages, totalCount] = await Promise.all([
      Message.find({ conversationId, isActive: true })
        .populate('senderId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Message.countDocuments({ conversationId, isActive: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages: messages.map(m => m.toJSON()).reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    next(error);
  }
};

// Get message by ID
export const getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id)
      .populate('senderId', 'name email role');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is a participant in the conversation
    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this message'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: message.toJSON()
      }
    });
  } catch (error) {
    logger.error('Get message by ID error:', error);
    next(error);
  }
};

// Update message (edit)
export const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Check if message is too old to edit (e.g., 24 hours)
    const editTimeLimit = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - message.createdAt.getTime() > editTimeLimit) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit'
      });
    }

    // Update message
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    // Populate message data
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name email role');

    // Emit updated message to conversation participants
    io.to(`conversation-${message.conversationId}`).emit('message-updated', {
      message: populatedMessage.toJSON(),
      conversationId: message.conversationId
    });

    logger.info(`Message updated by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: {
        message: populatedMessage.toJSON()
      }
    });
  } catch (error) {
    logger.error('Update message error:', error);
    next(error);
  }
};

// Delete message
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Soft delete message
    message.isActive = false;
    message.deletedAt = new Date();
    await message.save();

    // Emit message deletion to conversation participants
    io.to(`conversation-${message.conversationId}`).emit('message-deleted', {
      messageId: message._id,
      conversationId: message.conversationId
    });

    logger.info(`Message deleted by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    next(error);
  }
};

// Mark message as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is a participant in the conversation
    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to mark this message as read'
      });
    }

    // Don't mark own messages as read
    if (message.senderId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark your own message as read'
      });
    }

    // Check if already marked as read
    const existingRead = message.readBy.find(
      read => read.userId.toString() === userId.toString()
    );

    if (existingRead) {
      return res.status(400).json({
        success: false,
        message: 'Message already marked as read'
      });
    }

    // Mark as read
    message.readBy.push({
      userId: userId,
      readAt: new Date()
    });

    await message.save();

    // Emit read receipt to conversation participants
    io.to(`conversation-${message.conversationId}`).emit('message-read', {
      messageId: message._id,
      readBy: userId,
      readAt: new Date(),
      conversationId: message.conversationId
    });

    logger.info(`Message marked as read by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    logger.error('Mark message as read error:', error);
    next(error);
  }
};

// Get unread messages count
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all conversations user is part of
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    });

    const conversationIds = conversations.map(c => c._id);

    // Count unread messages
    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userId },
      'readBy.userId': { $ne: userId },
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    logger.error('Get unread messages count error:', error);
    next(error);
  }
};

// Search messages
export const searchMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { q, conversationId, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build filter
    const filter = {
      content: { $regex: q, $options: 'i' },
      isActive: true
    };

    // If conversationId is provided, filter by conversation
    if (conversationId) {
      // Check if user is a participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.some(p => p.toString() === userId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to search messages in this conversation'
        });
      }
      filter.conversationId = conversationId;
    } else {
      // Get all conversations user is part of
      const conversations = await Conversation.find({
        participants: userId,
        isActive: true
      });
      const conversationIds = conversations.map(c => c._id);
      filter.conversationId = { $in: conversationIds };
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Execute search
    const [messages, totalCount] = await Promise.all([
      Message.find(filter)
        .populate('senderId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Message.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages: messages.map(m => m.toJSON()),
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    logger.error('Search messages error:', error);
    next(error);
  }
};