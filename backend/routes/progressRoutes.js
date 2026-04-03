const express = require('express');
const router = express.Router();
const { getStudentProgress, getClassProgress, updateProgress, getMyProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

// Inline role guard — only teacher or admin
const teacherOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
        return next();
    }
    res.status(403).json({ message: 'Access denied. Teachers only.' });
};

// Student: fetch their own progress summary
router.get('/me', protect, getMyProgress);

// Student updates their own progress
router.post('/', protect, updateProgress);

// Teacher/Admin views
router.get('/', protect, teacherOnly, getClassProgress);
router.get('/student/:studentId', protect, getStudentProgress);

module.exports = router;
