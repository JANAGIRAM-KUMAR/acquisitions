import logger from '#config/logger.js';
import { cookies } from '#utils/cookies.js';
import { jwtToken } from '#utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');
    if (!token) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const decoded = jwtToken.verify(token);
    req.user = decoded;
    next();
  } catch (e) {
    logger.error('Authentication failed:', e);
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Access denied for user ${req.user.id} with role ${req.user.role}`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};
