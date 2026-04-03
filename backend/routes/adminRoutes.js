const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getAllTasks } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/users')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route('/users/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.route('/tasks')
  .get(protect, admin, getAllTasks);

module.exports = router;
