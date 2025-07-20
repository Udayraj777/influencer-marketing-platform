import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { logger } from '../utils/logger.js';

// Helper function to create and send token response
const createTokenResponse = (user, statusCode, res) => {
  const token = user.generateJWT();
  const refreshToken = user.generateRefreshToken();
  
  // Save refresh token to database
  user.save();
  
  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  res.status(statusCode)
    .cookie('jwt', token, cookieOptions)
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    })
    .json({
      success: true,
      message: statusCode === 201 ? 'User registered successfully' : 'Login successful',
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });
};

// Register new user
export const register = async (req, res, next) => {
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

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      passwordHash: password,
      role
    });

    // Generate email verification token
    const emailVerificationToken = user.generateEmailVerificationToken();
    await user.save();

    logger.info(`New user registered: ${user.email} (${user.role})`);

    // TODO: Send email verification email
    // For now, we'll auto-verify in development
    if (process.env.NODE_ENV === 'development') {
      user.isEmailVerified = true;
      await user.save();
    }

    createTokenResponse(user, 201, res);
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
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

    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findByEmail(email).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    createTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id).select('+refreshToken +refreshTokenExpires');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token is expired
    if (user.refreshTokenExpires < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    // Generate new tokens
    const newToken = user.generateJWT();
    const newRefreshToken = user.generateRefreshToken();
    await user.save();

    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.status(200)
      .cookie('jwt', newToken, cookieOptions)
      .cookie('refreshToken', newRefreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })
      .json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
  } catch (error) {
    logger.error('Token refresh error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    next(error);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user) {
      // Clear refresh token from database
      user.refreshToken = undefined;
      user.refreshTokenExpires = undefined;
      await user.save();
    }

    res.status(200)
      .clearCookie('jwt')
      .clearCookie('refreshToken')
      .json({
        success: true,
        message: 'Logged out successfully'
      });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

// Get current user profile
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Populate profile based on user role
    let populatedUser;
    if (user.role === 'influencer') {
      populatedUser = await User.findById(user._id).populate({
        path: 'profileId',
        model: 'InfluencerProfile'
      });
    } else if (user.role === 'business') {
      populatedUser = await User.findById(user._id).populate({
        path: 'profileId',
        model: 'BusinessProfile'
      });
    } else {
      populatedUser = user;
    }

    res.status(200).json({
      success: true,
      data: {
        user: populatedUser.toJSON()
      }
    });
  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
};

// Update user profile (basic info)
export const updateProfile = async (req, res, next) => {
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

    const { name, email } = req.body;
    const user = req.user;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken'
        });
      }
      user.email = email;
      user.isEmailVerified = false; // Reset email verification
    }

    if (name) user.name = name;

    await user.save();

    logger.info(`User profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
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

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+passwordHash');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If a user with that email exists, a password reset link has been sent'
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send password reset email
    logger.info(`Password reset requested for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'If a user with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('+passwordResetToken +passwordResetExpires');
    if (!user || user.passwordResetToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    if (user.passwordResetExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Update password and clear reset token
    user.passwordHash = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Verify email token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('+emailVerificationToken +emailVerificationExpires');
    if (!user || user.emailVerificationToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if token is expired
    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }

    // Verify email and clear verification token
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`Email verified for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }
    next(error);
  }
};

// Resend email verification
export const resendEmailVerification = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // TODO: Send verification email
    logger.info(`Email verification resent for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error('Resend email verification error:', error);
    next(error);
  }
};

// Delete account
export const deleteAccount = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Soft delete - deactivate account
    user.isActive = false;
    await user.save();

    // Also deactivate profile if exists
    if (user.profileId) {
      if (user.role === 'influencer') {
        await InfluencerProfile.findByIdAndUpdate(user.profileId, { isActive: false });
      } else if (user.role === 'business') {
        await BusinessProfile.findByIdAndUpdate(user.profileId, { isActive: false });
      }
    }

    logger.info(`Account deleted for: ${user.email}`);

    res.status(200)
      .clearCookie('jwt')
      .clearCookie('refreshToken')
      .json({
        success: true,
        message: 'Account deleted successfully'
      });
  } catch (error) {
    logger.error('Delete account error:', error);
    next(error);
  }
};