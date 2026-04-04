const express = require('express');
const router = express.Router();
const { getStudentProgress, getClassProgress, updateProgress, getMyProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');


const teacherOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
        return next();
    }
    res.status(403).json({ message: 'Access denied. Teachers only.' });
};


router.get('/me', protect, getMyProgress);


router.post('/', protect, updateProgress);


router.get('/', protect, teacherOnly, getClassProgress);
router.get('/student/:studentId', protect, getStudentProgress);

module.exports = router;
