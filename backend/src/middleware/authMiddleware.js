import jwt from 'jsonwebtoken';

/**
 * Verifies Bearer JWT and attaches `req.user` with `userId` and `role`.
 */
export function authenticateJwt(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret);
    req.user = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
