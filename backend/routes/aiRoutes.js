const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatWithAI, resolveVoiceIntent, sarvamTTS, sarvamSTT } = require('../controllers/aiController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Chat with Sarvam AI
router.post('/chat', protect, chatWithAI);

// Resolve voice navigation / accessibility command intent using Sarvam AI
router.post('/voice-intent', protect, resolveVoiceIntent);

// Sarvam Text-to-Speech proxy (auth not required so frontend can call freely)
router.post('/tts', protect, sarvamTTS);

// Sarvam Speech-to-Text proxy (accepts audio blob)
router.post('/stt', protect, upload.single('file'), sarvamSTT);

module.exports = router;
