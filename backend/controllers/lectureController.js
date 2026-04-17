const Lecture = require('../models/Lecture');
const path = require('path');
const fs = require('fs');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract a YouTube video ID from common URL formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/lectures
 * Returns all lectures, newest first. Authenticated users only.
 */
const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find()
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/lectures
 * Teacher-only. Accepts JSON (YouTube) or multipart/form-data (upload).
 * Body fields: title, description, type, youtubeUrl (if type=youtube)
 * File field:  video (if type=upload)
 */
const createLecture = async (req, res) => {
  try {
    const { title, description, type, youtubeUrl } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: 'title and type are required.' });
    }

    if (type === 'youtube') {
      if (!youtubeUrl) {
        return res.status(400).json({ message: 'youtubeUrl is required for YouTube lectures.' });
      }
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ message: 'Could not parse a valid YouTube video ID from the URL.' });
      }

      const lecture = await Lecture.create({
        title,
        description: description || '',
        teacher: req.user._id,
        type: 'youtube',
        youtubeUrl,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      });
      await lecture.populate('teacher', 'name email');
      return res.status(201).json(lecture);
    }

    if (type === 'upload') {
      if (!req.file) {
        return res.status(400).json({ message: 'A video file is required for uploaded lectures.' });
      }
      const lecture = await Lecture.create({
        title,
        description: description || '',
        teacher: req.user._id,
        type: 'upload',
        videoPath: `/uploads/lectures/${req.file.filename}`,
      });
      await lecture.populate('teacher', 'name email');
      return res.status(201).json(lecture);
    }

    return res.status(400).json({ message: "type must be 'youtube' or 'upload'." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/lectures/:id
 * Teacher-only. Only the owning teacher can delete their lecture.
 */
const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found.' });
    if (lecture.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own lectures.' });
    }

    // Remove uploaded file from disk if applicable
    if (lecture.type === 'upload' && lecture.videoPath) {
      const filePath = path.join(__dirname, '..', lecture.videoPath);
      fs.unlink(filePath, () => {}); // best-effort
    }

    await lecture.deleteOne();
    res.json({ message: 'Lecture deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLectures, createLecture, deleteLecture };
