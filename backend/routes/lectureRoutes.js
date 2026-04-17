const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const { getLectures, createLecture, deleteLecture } = require('../controllers/lectureController');

// ─── Teacher-only guard ───────────────────────────────────────────────────────
const teacherOnly = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') return next();
  res.status(403).json({ message: 'Access denied: teachers only' });
};

// ─── Multer storage for uploaded videos ──────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads', 'lectures');
// Create directory if it doesn't exist yet
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB cap
  fileFilter: (_req, file, cb) => {
    const allowed = /mp4|webm|mov|mkv|avi/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Only video files are allowed (mp4, webm, mov, mkv, avi).'));
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get('/', protect, getLectures);
router.post('/', protect, teacherOnly, upload.single('video'), createLecture);
router.delete('/:id', protect, teacherOnly, deleteLecture);

module.exports = router;
