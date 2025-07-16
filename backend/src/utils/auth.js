import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from './logger.js';

// Generate JWT token
export const generateToken = (payload, options = {}) => {
  try {
    const defaultOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'connectsphere',
      audience: 'connectsphere-users'
    };

    const tokenOptions = { ...defaultOptions, ...options };
    return jwt.sign(payload, process.env.JWT_SECRET, tokenOptions);
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Token generation failed');
  }
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        issuer: 'connectsphere',
        audience: 'connectsphere-users'
      }
    );
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Refresh token generation failed');
  }
};

// Verify JWT token
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'connectsphere',
      audience: 'connectsphere-users'
    });
  } catch (error) {
    logger.error('Error verifying JWT token:', error);
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    }
    
    throw new Error('Token verification failed');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'connectsphere',
      audience: 'connectsphere-users'
    });
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token type');
    }
    
    return decoded;
  } catch (error) {
    logger.error('Error verifying refresh token:', error);
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    
    throw new Error('Refresh token verification failed');
  }
};

// Hash password
export const hashPassword = async (password) => {
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};

// Compare password
export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Password comparison failed');
  }
};

// Generate random token for password reset, email verification, etc.
export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate secure random password
export const generateSecurePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

// Password strength validator
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    strength: calculatePasswordStrength(password)
  };
};

// Calculate password strength score
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/123|234|345|456|567|678|789|890/.test(password)) score -= 1; // Sequential numbers
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/.test(password.toLowerCase())) score -= 1; // Sequential letters
  
  // Normalize score to 0-4 scale
  score = Math.max(0, Math.min(4, score));
  
  const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return {
    score: score,
    level: strengthLevels[score]
  };
};

// Email validator
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiting helper
export const isRateLimited = (attempts, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const validAttempts = attempts.filter(attempt => now - attempt < windowMs);
  
  return validAttempts.length >= maxAttempts;
};

// Clean expired attempts from rate limiting
export const cleanExpiredAttempts = (attempts, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  return attempts.filter(attempt => now - attempt < windowMs);
};

// Generate API key
export const generateApiKey = (prefix = 'cs') => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${timestamp}_${randomPart}`;
};

// Validate API key format
export const validateApiKeyFormat = (apiKey) => {
  const apiKeyRegex = /^[a-zA-Z0-9]+_[a-zA-Z0-9]+_[a-zA-Z0-9]+$/;
  return apiKeyRegex.test(apiKey);
};

// Token blacklist utilities (for logout functionality)
const tokenBlacklist = new Set();

export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  
  // Clean up expired tokens periodically
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 7 * 24 * 60 * 60 * 1000); // Remove after 7 days
};

export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Secure session token generator
export const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('base64url');
};

// Validate session token format
export const validateSessionTokenFormat = (token) => {
  const sessionTokenRegex = /^[A-Za-z0-9_-]+$/;
  return sessionTokenRegex.test(token) && token.length >= 32;
};

// TOTP (Time-based One-Time Password) utilities for 2FA
export const generateTOTPSecret = () => {
  return crypto.randomBytes(20).toString('base32');
};

export const generateTOTP = (secret, window = 0) => {
  const time = Math.floor(Date.now() / 30000) + window;
  const buffer = Buffer.allocUnsafe(8);
  
  for (let i = 7; i >= 0; i--) {
    buffer[i] = time & 0xff;
    time >>= 8;
  }
  
  const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base32'));
  hmac.update(buffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0xf;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
  
  return (code % 1000000).toString().padStart(6, '0');
};

export const verifyTOTP = (token, secret, window = 1) => {
  for (let i = -window; i <= window; i++) {
    if (generateTOTP(secret, i) === token) {
      return true;
    }
  }
  return false;
};

// Utility to extract token from Authorization header
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
};

// Utility to create authentication response
export const createAuthResponse = (user, token, refreshToken = null) => {
  const response = {
    success: true,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profileId: user.profileId,
      createdAt: user.createdAt
    },
    token: token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  };
  
  if (refreshToken) {
    response.refreshToken = refreshToken;
  }
  
  return response;
};

// Utility to mask sensitive data in logs
export const maskSensitiveData = (data) => {
  const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'secret'];
  const masked = { ...data };
  
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***MASKED***';
    }
  });
  
  return masked;
};