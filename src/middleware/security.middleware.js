import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user ? req.user.role : 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20; // High limit for admins
        message =
          'Admin request limit exceeded only 20 requests per minute allowed';
        break;
      case 'user':
        limit = 10; // Moderate limit for regular users
        message =
          'User request limit exceeded only 10 requests per minute allowed';
        break;
      case 'guest':
        limit = 5; // Low limit for guests
        message =
          'Guest request limit exceeded only 5 requests per minute allowed';
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
        message,
      })
    );

    const decision = await client.protect(req);

    // if (decision.isDenied() && decision.reason.isBot()) {
    //   logger.warn('Bot request blocked', {
    //     ip: req.ip,
    //     path: req.path,
    //     userAgent: req.get('User-Agent'),
    //   });
    //   return res.status(403).json({
    //     error: 'Forbidden',
    //     message: 'Automated requests are not allowed',
    //   });
    // }
    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request blocked', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        method: req.method,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message:
          'Shield blocked the request blocked due to security policy violation',
      });
    }
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn(`Rate limit exceeded for role: ${role}`, {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });
      return res
        .status(429)
        .json({ error: 'Too Many Requests', message: 'Rate limit exceeded' });
    }
    next();
  } catch (error) {
    console.log('Error in arcjet securiy Middleware', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default securityMiddleware;
