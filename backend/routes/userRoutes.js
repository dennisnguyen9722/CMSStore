const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// Áp dụng middleware cho từng route
router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.post('/', authenticate, isAdmin, createUser); // chỉ admin được thêm
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, isAdmin, deleteUser); // chỉ admin được xoá

module.exports = router;
