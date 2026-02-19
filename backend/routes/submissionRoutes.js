const express = require('express');
const router = express.Router();
const { createSubmission, getSubmissions } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSubmission)
    .get(protect, getSubmissions);

module.exports = router;
