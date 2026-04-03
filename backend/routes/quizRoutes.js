const express = require('express');
const router = express.Router();
const { createQuiz, getQuizByLesson } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createQuiz);

router.route('/:lessonId')
    .get(protect, getQuizByLesson);

module.exports = router;
