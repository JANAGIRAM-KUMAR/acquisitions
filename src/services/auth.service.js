import db from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (err) {
    logger.error('Error hashing password:', err);
    throw new Error('Failed to hash password', { cause: err });
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    logger.error('Error comparing password:', err);
    throw new Error('Failed to compare password', { cause: err });
  }
};

export const authenticateUser = async (email, password) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    logger.info(`User authenticated successfully: ${email}`);
    return user;
  } catch (err) {
    logger.error('Error authenticating user:', err);
    throw err;
  }
};

export const createUser = async (name, email, password, role = 'user') => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        password: users.password,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    logger.info(`User created successfully: ${email} with role ${role}`);
    return newUser;
  } catch (err) {
    logger.error('Error creating user:', err);
    throw new Error('Failed to create user', { cause: err });
  }
};
