const express = require('express');
const router = express.Router();
const { getStudentProgress, getClassProgress, updateProgress } = require('../controllers/progressController');
const { protect, teacher } = require('../middleware/authMiddleware');

// Student updates their own progress
router.post('/', protect, updateProgress);

// Teacher/Admin views
router.get('/', protect, teacher, getClassProgress);
router.get('/student/:studentId', protect, getStudentProgress);

module.exports = router;
