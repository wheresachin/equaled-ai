const express = require('express');
const router = express.Router();
const { createSubmission, getSubmissions, getSubmissionsByLesson, addFeedback } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSubmission)
    .get(protect, getSubmissions);

router.route('/lesson/:lessonId')
    .get(protect, getSubmissionsByLesson);

router.route('/:id/feedback')
    .post(protect, addFeedback);

module.exports = router;
