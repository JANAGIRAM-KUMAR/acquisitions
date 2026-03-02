import db from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';

export const getAllUsers = async () => {
    try {
        return await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        }).from(users);
    } catch (err) {
        logger.error('Error fetching all users:', err);
        throw new Error('Failed to fetch users', { cause: err });
    }
};
