import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';

const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin@12345';
const DEFAULT_ADMIN_NAME = 'Super Admin';

async function executeReset() {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }
  const isTlsInsecureMode = process.env.MONGODB_TLS_INSECURE === 'true';
  await mongoose.connect(mongodbUri, {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    family: 4,
    tls: true,
    tlsAllowInvalidCertificates: isTlsInsecureMode,
    tlsAllowInvalidHostnames: isTlsInsecureMode,
  });
  const adminEmail = DEFAULT_ADMIN_EMAIL.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: DEFAULT_ADMIN_NAME,
      email: adminEmail,
      password: passwordHash,
      role: 'SUPER_ADMIN',
      isVerified: true,
    });
    console.log(`Created ${adminEmail} with role SUPER_ADMIN`);
    return;
  }
  existingAdmin.name = DEFAULT_ADMIN_NAME;
  existingAdmin.password = passwordHash;
  existingAdmin.role = 'SUPER_ADMIN';
  existingAdmin.isVerified = true;
  await existingAdmin.save();
  console.log(`Reset credentials for ${adminEmail}`);
}

executeReset()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
