import { verifyToken } from '../utils/jwt.js';

export function requireAuth(allowedRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    try {
      const payload = verifyToken(token);

      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden'
        });
      }

      req.auth = payload;
      next();
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }
  };
}
