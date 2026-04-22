import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { isNonEmptyString, isValidEmail, isValidMobile } from '../utils/validators.js';

const ADMIN_ROLES = ['SUPER_ADMIN', 'SALES_MANAGER'];
const CUSTOMER_TIERS = ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'];

/** POST /api/admin/create — SUPER_ADMIN only (enforced in route) */
export async function createAdmin(req, res) {
  try {
    const { name, email, mobile, role } = req.body;
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: 'Name required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email required' });
    }
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: 'Valid mobile required' });
    }
    if (!ADMIN_ROLES.includes(role)) {
      return res.status(400).json({ message: 'role must be SUPER_ADMIN or SALES_MANAGER' });
    }
    const emailNorm = email.toLowerCase().trim();
    const mobileNorm = mobile.replace(/\D/g, '').slice(-10);
    const dup = await User.findOne({ $or: [{ email: emailNorm }, { mobile: mobileNorm }] });
    if (dup) {
      return res.status(409).json({ message: 'Email or mobile already in use' });
    }
    const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}!`;
    const hash = await bcrypt.hash(tempPassword, 10);
    const user = await User.create({
      name: name.trim(),
      email: emailNorm,
      mobile: mobileNorm,
      password: hash,
      role,
      isVerified: true,
    });
    return res.status(201).json({
      message: 'Admin created',
      userId: user._id,
      temporaryPassword: tempPassword,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** GET /api/admin/users — SUPER_ADMIN only */
export async function listUsers(req, res) {
  try {
    const users = await User.find().select('-password -otp -resetPasswordToken').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** POST /api/admin/customers — SUPER_ADMIN only */
export async function createCustomer(req, res) {
  try {
    const { name, email, mobile, city, tier, creditLimit } = req.body;
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: 'Customer/shop name required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email required' });
    }
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: 'Valid mobile required' });
    }
    if (!CUSTOMER_TIERS.includes(tier)) {
      return res.status(400).json({ message: 'tier must be STANDARD, SILVER, GOLD or PLATINUM' });
    }
    const emailNorm = email.toLowerCase().trim();
    const mobileNorm = mobile.replace(/\D/g, '').slice(-10);
    const duplicateCustomer = await User.findOne({ $or: [{ email: emailNorm }, { mobile: mobileNorm }] });
    if (duplicateCustomer) {
      return res.status(409).json({ message: 'Email or mobile already in use' });
    }
    const customerUser = await User.create({
      name: name.trim(),
      email: emailNorm,
      mobile: mobileNorm,
      role: 'CUSTOMER',
      isVerified: true,
      city: isNonEmptyString(city) ? city.trim() : '',
      tier,
      creditLimit: Number.isFinite(Number(creditLimit)) ? Number(creditLimit) : 5000,
    });
    return res.status(201).json({
      message: 'Customer created',
      customer: customerUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
