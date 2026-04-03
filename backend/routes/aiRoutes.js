const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatWithAI } = require('../controllers/aiController');

// POST /api/ai/chat  — JWT protected, student-only (enforced in controller)
router.post('/chat', protect, chatWithAI);

module.exports = router;
