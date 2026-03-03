import {
  fetchAllUsers,
  fetchUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import { authenticateToken, requireRole } from '#middleware/auth.middleware.js';
import express from 'express';
const router = express.Router();

router.get('/', authenticateToken, requireRole('admin'), fetchAllUsers);

router.get('/:id', authenticateToken, fetchUserById);

router.put('/:id', authenticateToken, updateUser);

router.delete('/:id', authenticateToken, requireRole('admin'), deleteUser);

export default router;
