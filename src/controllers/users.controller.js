import logger from "#config/logger.js";
import { getAllUsers } from "#services/users.service.js";

export const fetchAllUsers = async (req, res, next) => {
    try {
        logger.info('Fetching all users');
        const allUsers = getAllUsers();
        res.json({
            message: 'Users fetched successfully',
            users: allUsers,
            count: allUsers.length
        })
    } catch (err) {
        logger.error('Error in getAllUsers controller:', err);
        next(err);
    }
};