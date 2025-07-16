import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: {
      values: ['influencer', 'business'],
      message: 'Role must be either influencer or business'
    },
    required: [true, 'Role is required']
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'profileModel',
    default: null
  },
  profileModel: {
    type: String,
    enum: ['InfluencerProfile', 'BusinessProfile'],
    required: function() {
      return this.profileId != null;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    select: false
  },
  refreshTokenExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for profile population
userSchema.virtual('profile', {
  ref: function() {
    return this.role === 'influencer' ? 'InfluencerProfile' : 'BusinessProfile';
  },
  localField: 'profileId',
  foreignField: '_id',
  justOne: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('passwordHash')) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Set profileModel based on role
userSchema.pre('save', function(next) {
  if (this.profileId) {
    this.profileModel = this.role === 'influencer' ? 'InfluencerProfile' : 'BusinessProfile';
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method to generate JWT token
userSchema.methods.generateJWT = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const refreshToken = jwt.sign(
    { 
      id: this._id, 
      type: 'refresh' 
    },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' 
    }
  );
  
  // Set refresh token and expiry
  this.refreshToken = refreshToken;
  this.refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  return refreshToken;
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = jwt.sign(
    { 
      id: this._id, 
      type: 'reset' 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '1h' 
    }
  );
  
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = jwt.sign(
    { 
      id: this._id, 
      type: 'verify' 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '24h' 
    }
  );
  
  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return verificationToken;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.refreshToken;
  delete user.refreshTokenExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;