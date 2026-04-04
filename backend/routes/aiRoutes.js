const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatWithAI } = require('../controllers/aiController');


router.post('/chat', protect, chatWithAI);

module.exports = router;
