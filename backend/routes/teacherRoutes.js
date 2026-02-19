const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMyStudents,
    addStudentByEmail,
    removeStudent,
    assignTask,
    getMyTasks,
} = require('../controllers/teacherController');

// Middleware to ensure user is a teacher
const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') return next();
    res.status(403).json({ message: 'Access denied: teachers only' });
};

router.get('/students', protect, teacherOnly, getMyStudents);
router.post('/students', protect, teacherOnly, addStudentByEmail);
router.delete('/students/:studentId', protect, teacherOnly, removeStudent);
router.post('/tasks', protect, teacherOnly, assignTask);
router.get('/tasks', protect, teacherOnly, getMyTasks);

module.exports = router;
