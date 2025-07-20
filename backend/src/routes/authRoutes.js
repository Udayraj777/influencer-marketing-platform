import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  deleteAccount
} from '../controllers/authController.js';
import { protect as authenticate } from '../middleware/authMiddleware.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  sanitizeInput
} from '../validators/authValidators.js';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.get('/verify-email/:token', verifyEmailValidator, verifyEmail);

// Protected routes (require authentication)
router.use(authenticate); // All routes below this point require authentication

router.get('/me', getMe);
router.put('/me', updateProfileValidator, updateProfile);
router.post('/change-password', changePasswordValidator, changePassword);
router.post('/resend-verification', resendEmailVerification);
router.post('/logout', logout);
router.delete('/delete-account', deleteAccount);

export default router;