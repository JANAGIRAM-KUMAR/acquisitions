import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import { formatValidationErrors } from '#utils/format.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users');
    const allUsers = await getAllUsers();
    res.json({
      message: 'Users fetched successfully',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (err) {
    logger.error('Error in getAllUsers controller:', err);
    next(err);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const paramResult = userIdSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramResult.error),
      });
    }
    const { id } = paramResult.data;

    logger.info(`Fetching user by ID: ${id}`);
    const user = await getUserByIdService(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User fetched successfully', user });
  } catch (err) {
    logger.error('Error in getUserById controller:', err);
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const paramResult = userIdSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramResult.error),
      });
    }
    const { id } = paramResult.data;

    const bodyResult = updateUserSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(bodyResult.error),
      });
    }
    const updates = bodyResult.data;

    // Only authenticated users can update their own info
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'You can only update your own information' });
    }

    // Only admins can change the role field
    if (updates.role && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Only admins can change user roles' });
    }

    logger.info(`Updating user ID: ${id}`);
    const updatedUser = await updateUserService(id, updates);
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    logger.error('Error in updateUser controller:', err);
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const paramResult = userIdSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramResult.error),
      });
    }
    const { id } = paramResult.data;

    logger.info(`Deleting user ID: ${id}`);
    const deleted = await deleteUserService(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    logger.error('Error in deleteUser controller:', err);
    next(err);
  }
};
