import mongoose from 'mongoose';

const ROLES = ['SUPER_ADMIN', 'SALES_MANAGER', 'CUSTOMER'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, sparse: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, sparse: true, unique: true, trim: true },
    city: { type: String, default: '' },
    tier: { type: String, enum: ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'], default: 'STANDARD' },
    creditLimit: { type: Number, default: 5000 },
    password: { type: String, default: '' },
    role: { type: String, enum: ROLES, default: 'CUSTOMER' },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
export { ROLES };
