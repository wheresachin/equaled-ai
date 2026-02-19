const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, lessonController.getLessons)
    .post(protect, lessonController.createLesson);

router.route('/:id')
    .get(protect, lessonController.getLessonById)
    .delete(protect, lessonController.deleteLesson)
    .put(protect, lessonController.updateLesson);

module.exports = router;
