import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, AppError } from './errorMiddleware.js';
import { verifyToken, extractTokenFromHeader, isTokenBlacklisted } from '../utils/auth.js';
import { logger } from '../utils/logger.js';

// Protect routes - require valid JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization) {
    token = extractTokenFromHeader(req.headers.authorization);
  }

  // Check for token in cookies (alternative method)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  try {
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return next(new AppError('Token has been invalidated', 401));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+isActive');
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return next(new AppError('User account has been deactivated', 401));
    }

    // Check if user changed password after token was issued
    if (currentUser.passwordChangedAt) {
      const changedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return next(new AppError('User recently changed password. Please log in again.', 401));
      }
    }

    // Update last login
    currentUser.lastLogin = new Date();
    await currentUser.save({ validateBeforeSave: false });

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.message === 'Token expired') {
      return next(new AppError('Token expired. Please log in again.', 401));
    } else if (error.message === 'Invalid token') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    
    return next(new AppError('Authentication failed', 401));
  }
});

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization) {
    token = extractTokenFromHeader(req.headers.authorization);
  }

  // Check for token in cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return next();
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+isActive');
    if (!currentUser || !currentUser.isActive) {
      return next();
    }

    // Set user in request if valid
    req.user = currentUser;
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
});

// Check if user owns resource
export const checkResourceOwnership = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resource = req.resource || req.body || req.params;
    const resourceUserId = resource[resourceUserField];

    if (!resourceUserId) {
      return next(new AppError('Resource ownership cannot be determined', 400));
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only access your own resources', 403));
    }

    next();
  };
};

// Check if user is profile owner or admin
export const checkProfileOwnership = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const profileId = req.params.id || req.params.profileId;
  
  if (!profileId) {
    return next(new AppError('Profile ID is required', 400));
  }

  // Check if user is trying to access their own profile
  if (req.user.profileId && req.user.profileId.toString() === profileId) {
    return next();
  }

  // Check if user is admin (future implementation)
  if (req.user.role === 'admin') {
    return next();
  }

  return next(new AppError('You can only access your own profile', 403));
});

// Verify email required middleware
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.isEmailVerified) {
    return next(new AppError('Email verification required to access this resource', 403));
  }

  next();
};

// Rate limiting middleware for authentication endpoints
export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + ':' + (req.body.email || req.body.username || 'unknown');
    const now = Date.now();

    if (!attempts.has(key)) {
      attempts.set(key, []);
    }

    const userAttempts = attempts.get(key);
    const validAttempts = userAttempts.filter(attempt => now - attempt < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return next(new AppError('Too many authentication attempts. Please try again later.', 429));
    }

    // Add current attempt
    validAttempts.push(now);
    attempts.set(key, validAttempts);

    // Clean up old entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean up
      for (const [k, v] of attempts.entries()) {
        const validEntries = v.filter(attempt => now - attempt < windowMs);
        if (validEntries.length === 0) {
          attempts.delete(k);
        } else {
          attempts.set(k, validEntries);
        }
      }
    }

    next();
  };
};

// Middleware to check if user has completed profile setup
export const requireCompleteProfile = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.profileId) {
    return next(new AppError('Profile setup required to access this resource', 403));
  }

  // Load the profile to check if it's complete
  const ProfileModel = req.user.role === 'influencer' ? 
    (await import('../models/InfluencerProfile.js')).default : 
    (await import('../models/BusinessProfile.js')).default;

  const profile = await ProfileModel.findById(req.user.profileId);

  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }

  if (!profile.isProfileComplete) {
    return next(new AppError('Please complete your profile setup to access this resource', 403));
  }

  // Attach profile to request for convenience
  req.profile = profile;
  next();
});

// Middleware to check subscription status (for business users)
export const checkSubscriptionStatus = (requiredFeatures = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user.role !== 'business') {
      return next(); // Only check subscription for business users
    }

    if (!req.user.profileId) {
      return next(new AppError('Business profile required', 403));
    }

    const BusinessProfile = (await import('../models/BusinessProfile.js')).default;
    const profile = await BusinessProfile.findById(req.user.profileId);

    if (!profile) {
      return next(new AppError('Business profile not found', 404));
    }

    // Check if subscription is active
    if (!profile.subscription.isActive) {
      return next(new AppError('Active subscription required', 403));
    }

    // Check if subscription has expired
    if (profile.subscription.endDate && profile.subscription.endDate < new Date()) {
      return next(new AppError('Subscription has expired', 403));
    }

    // Check if required features are available
    for (const feature of requiredFeatures) {
      if (!profile.hasFeature(feature)) {
        return next(new AppError(`Upgrade required: ${feature} is not available in your current plan`, 403));
      }
    }

    req.businessProfile = profile;
    next();
  });
};

// Middleware to log authentication events
export const logAuthEvent = (eventType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const user = req.user || req.body;
      const logData = {
        event: eventType,
        userId: user?._id || user?.id,
        email: user?.email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: res.statusCode < 400,
        statusCode: res.statusCode
      };

      if (res.statusCode >= 400) {
        logger.warn(`Authentication event failed: ${eventType}`, logData);
      } else {
        logger.info(`Authentication event: ${eventType}`, logData);
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// Middleware to handle CORS for authenticated routes
export const corsAuth = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};

// Middleware to validate JWT token format
export const validateTokenFormat = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next(new AppError('Authorization header required', 401));
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(new AppError('Invalid authorization header format. Use: Bearer <token>', 401));
  }

  const token = authHeader.substring(7);
  
  if (!token || token.length < 20) {
    return next(new AppError('Invalid token format', 401));
  }

  next();
};

// Middleware to check if user has specific permissions
export const checkPermissions = (permissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Admin users have all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has required permissions
    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export default {
  protect,
  restrictTo,
  optionalAuth,
  checkResourceOwnership,
  checkProfileOwnership,
  requireEmailVerification,
  authRateLimit,
  requireCompleteProfile,
  checkSubscriptionStatus,
  logAuthEvent,
  corsAuth,
  validateTokenFormat,
  checkPermissions
};