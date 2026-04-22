import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { generateOtp, isNonEmptyString, isValidEmail, isValidMobile } from '../utils/validators.js';

const OTP_TTL_MS = 10 * 60 * 1000;

function signToken(user) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret, { expiresIn: '7d' });
}

/** POST /api/auth/register/mobile */
export async function registerMobile(req, res) {
  try {
    const { mobile } = req.body;
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: 'Valid mobile is required' });
    }
    const normalized = mobile.replace(/\D/g, '').slice(-10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    let user = await User.findOne({ mobile: normalized });
    if (!user) {
      user = await User.create({
        name: 'Customer',
        mobile: normalized,
        role: 'CUSTOMER',
        isVerified: false,
        otp,
        otpExpiry,
      });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }
    return res.status(200).json({
      message: 'OTP sent (POC: returned in response for testing)',
      otpHint: otp,
      mobile: normalized,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** POST /api/auth/verify-otp — create/confirm mobile user */
export async function verifyRegisterOtp(req, res) {
  try {
    const { mobile, otp } = req.body;
    if (!isValidMobile(mobile) || !isNonEmptyString(otp)) {
      return res.status(400).json({ message: 'Mobile and OTP required' });
    }
    const normalized = mobile.replace(/\D/g, '').slice(-10);
    const user = await User.findOne({ mobile: normalized });
    if (!user || !user.otp || user.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    const token = signToken(user);
    return res.status(200).json({ message: 'Mobile verified', token, user: { id: user._id, role: user.role, mobile: user.mobile } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** POST /api/auth/register/email */
export async function registerEmail(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!isNonEmptyString(password) || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hash,
      role: 'CUSTOMER',
      isVerified: true,
    });
    return res.status(201).json({
      message: 'Registered',
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** POST /api/auth/login/email */
export async function loginEmail(req, res) {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user);
    return res.json({
      message: 'Login OK',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** POST /api/auth/login/otp */
export async function loginOtpRequest(req, res) {
  try {
    const { mobile } = req.body;
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: 'Valid mobile required' });
    }
    const normalized = mobile.replace(/\D/g, '').slice(-10);
    const user = await User.findOne({ mobile: normalized });
    if (!user) {
      return res.status(404).json({ message: 'No user with this mobile' });
    }
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    return res.json({
      message: 'OTP sent (POC: returned for testing)',
      otpHint: otp,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** POST /api/auth/verify-login-otp */
export async function verifyLoginOtp(req, res) {
  try {
    const { mobile, otp } = req.body;
    if (!isValidMobile(mobile) || !isNonEmptyString(otp)) {
      return res.status(400).json({ message: 'Mobile and OTP required' });
    }
    const normalized = mobile.replace(/\D/g, '').slice(-10);
    const user = await User.findOne({ mobile: normalized });
    if (!user || !user.otp || user.otp !== otp.trim()) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    const token = signToken(user);
    return res.json({
      message: 'Login OK',
      token,
      user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** POST /api/auth/forgot-password */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({ message: 'If account exists, reset instructions sent (POC)' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    return res.json({
      message: 'Reset token issued (POC: shown in response)',
      resetToken: token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** POST /api/auth/reset-password */
export async function resetPassword(req, res) {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!isValidEmail(email) || !isNonEmptyString(resetToken) || !isNonEmptyString(newPassword)) {
      return res.status(400).json({ message: 'email, resetToken, newPassword required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: resetToken.trim(),
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** GET /api/auth/me */
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
