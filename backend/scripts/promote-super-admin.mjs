import 'dotenv/config';
import mongoose from 'mongoose';

const DEFAULT_EMAIL = 'harinipugal371@gmail.com';

async function executePromotion() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }
  const isTlsInsecureMode = process.env.MONGODB_TLS_INSECURE === 'true';
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    family: 4,
    tls: true,
    tlsAllowInvalidCertificates: isTlsInsecureMode,
    tlsAllowInvalidHostnames: isTlsInsecureMode
  });
  const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
  const UserModel = mongoose.models.PromoteUser || mongoose.model('PromoteUser', userSchema);
  const email = (process.argv[2] || DEFAULT_EMAIL).toLowerCase().trim();
  const updatedUser = await UserModel.findOneAndUpdate(
    { email },
    { $set: { role: 'SUPER_ADMIN', isVerified: true } },
    { new: true }
  );
  if (!updatedUser) {
    console.log(`User not found for ${email}`);
    return;
  }
  console.log(`Role updated for ${updatedUser.email}: ${updatedUser.role}`);
}

executePromotion()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
