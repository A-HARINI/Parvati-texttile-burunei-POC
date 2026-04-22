import { Router } from 'express';
import { authenticateJwt } from '../middleware/authMiddleware.js';
import {
  forgotPassword,
  getMe,
  loginEmail,
  loginOtpRequest,
  registerEmail,
  registerMobile,
  resetPassword,
  verifyLoginOtp,
  verifyRegisterOtp,
} from '../controllers/authController.js';

const router = Router();

router.post('/register/mobile', registerMobile);
router.post('/verify-otp', verifyRegisterOtp);
router.post('/register/email', registerEmail);
router.post('/login/email', loginEmail);
router.post('/login/otp', loginOtpRequest);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateJwt, getMe);

export default router;
