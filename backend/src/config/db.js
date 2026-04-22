import mongoose from 'mongoose';

/**
 * Connects to MongoDB using MONGODB_URI from environment.
 * @returns {Promise<void>}
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  try {
    const isTlsInsecureMode = process.env.MONGODB_TLS_INSECURE === 'true';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4,
      tls: true,
      tlsAllowInvalidCertificates: isTlsInsecureMode,
      tlsAllowInvalidHostnames: isTlsInsecureMode,
    });
    if (isTlsInsecureMode) {
      console.warn('MongoDB connected with insecure TLS mode enabled (MONGODB_TLS_INSECURE=true). Use only for temporary troubleshooting.');
    } else {
      console.log('MongoDB connected (Atlas or local)');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('querySrv') || message.includes('ECONNREFUSED') && message.includes('_mongodb._tcp')) {
      console.error(`
[MongoDB] SRV DNS failed (common on Windows / some networks with mongodb+srv://).

Fix: In Atlas → your cluster → Connect → Drivers:
  - Expand and copy the **standard connection string** (starts with mongodb://, lists hosts on port 27017),
    NOT the mongodb+srv:// line.
  - Put it in MONGODB_URI. Password characters like @ must be URL-encoded (e.g. @ → %40).
`);
    }
    if (message.includes('ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') || message.includes('tlsv1 alert internal error')) {
      console.error(`
[MongoDB] TLS handshake failed with Atlas.

Quick fixes:
  1) Keep Atlas Network Access open for your current IP.
  2) Prefer Atlas STANDARD connection string (mongodb://...:27017 hosts) instead of mongodb+srv://.
  3) For temporary demo-only workaround, set:
       MONGODB_TLS_INSECURE=true
`);
    }
    throw err;
  }
}
