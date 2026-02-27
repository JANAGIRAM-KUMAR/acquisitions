import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d';

export const jwtToken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (err) {
      logger.error('Error signing JWT token:', err);
      throw new Error('Failed to sign JWT token', { cause: err });
    }
  },
  verify: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      logger.error('Error verifying JWT token:', err);
      throw new Error('Failed to verify JWT token', { cause: err });
    }
  },
};
