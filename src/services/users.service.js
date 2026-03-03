import db from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  } catch (err) {
    logger.error('Error fetching all users:', err);
    throw new Error('Failed to fetch users', { cause: err });
  }
};

export const getUserById = async (id) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user || null;
  } catch (err) {
    logger.error('Error fetching user by ID:', err);
    throw new Error('Failed to fetch user', { cause: err });
  }
};

export const updateUser = async (id, updates) => {
  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!existing) {
      throw new Error('User not found');
    }
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    logger.info(`User updated successfully: ID ${id}`);
    return updatedUser;
  } catch (err) {
    logger.error('Error updating user:', err);
    throw err;
  }
};

export const deleteUser = async (id) => {
  try {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return deleted || null;
  } catch (err) {
    logger.error('Error deleting user:', err);
    throw new Error('Failed to delete user', { cause: err });
  }
};
